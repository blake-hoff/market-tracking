import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import {Card, CardMedia, CardContent, Typography, Box, IconButton, AppBar, Toolbar, TextField} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

import RefreshIcon from '@mui/icons-material/Refresh';
import Collapse from "@mui/material/Collapse";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const App = () => {
    const [gridData, setGridData] = useState([]);
	const [prices, setPrices] = useState({});
	const [expanded, setExpanded] = useState({});

	const [searchValue, setSearchValue] = useState('');
	const [catalogData, setCatalogData] = useState([]); // for the catalog scrollable window
	const [showCatalog, setShowCatalog] = useState(false);

	const [priceHistory, setPriceHistory] = useState({}); // for the price history of all items. only gets populated/updated as you press getPrice for individual items.

    let serverURL = 'http://127.0.0.1:5000/api'
	let siteLogo = "/logo192.png" // starts by looking in the public folder

	const handleToggleExpand = async (id) => {
		setExpanded(prev => ({
			...prev,
			[id]: !prev[id]
		}));
		// only get the price history if the element is now opened
		if (!expanded[id]){
			// handleGetPrice(id);
			// handleItemClick(id);
			getPriceHistory(id);
		}
	};

	const handleGetPrice = async (id) => {
		try {
			console.log(priceHistory[id].created_at);
			const price = await getPrice(id);
			console.log(price)

			setPrices(prev => ({
				...prev,
				[id]: price
			}));
			getPriceHistory(id);
			// console.log(priceHistory[id]);
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleDeleteItem = async (id) => {
		// also get the price history
		try {
			const price = await deleteItem(id);
			console.log(price)
			getAll();
		}
		catch (err) {
			console.error(err);
		}
	};

	const handleItemClick = async (id) => {
		try {
			const response = await getItemDetails(id);
			console.log(response);

			getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleSearch = async () => {
		try {
			const response = await searchCatalog(searchValue);
			console.log(response);

			// setSearchValue('');
			setShowCatalog(true);
			// getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	//api functions
	const getAll = React.useCallback(async () => {
		let path = '/item';
		let url = serverURL + path;

		try {
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);
			console.log(newData);
			setGridData(newData.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [serverURL]);

	async function searchCatalog(keyword) {
		let path = '/search-roblox-catalog?keyword=' + keyword
		let url = serverURL + path
		console.log(url)

		try{
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);
			
			console.log(newData.item)
			setCatalogData(newData.item)
			// return newData.item
        }
		catch (err) {
			console.log("Something went wrong!", err);
			alert(err);
			return null;
		}
	}

	async function getPrice(id) {
		// console.log(id);
		let path = '/item-price/' + id
		let url = serverURL + path
		console.log(url)

		try{
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			console.log(newData.item.price)
			return newData.item.price
        }
		catch (err) {
			console.log("Something went wrong!", err);
			alert(err);
			return null;
		}
	}

	async function getItemDetails(id) {
		// console.log(id);
		let path = '/item/' + id
		let url = serverURL + path
		console.log(url)

		try{
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			console.log(newData.item)
			// return newData.item
        }
		catch (err) {
			console.log("Something went wrong!", err);
			alert(err);
			return null;
		}
	}

	async function getPriceHistory(id) {
		// console.log(id);
		let path = '/item-price-history/' + id;
		let url = serverURL + path;
		console.log(url);

		try{
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			console.log(newData.history);
			setPriceHistory(prev => ({
				...prev,
				[id]: {
    				prices: newData.history.prices,
    				created_at: newData.history.created_at.map(d => new Date(d))
  				}
			}));
			// return newData.item
        }
		catch (err) {
			console.log("Something went wrong!", err);
			alert(err);
			return null;
		}
	}

	async function deleteItem(id) {
		// console.log(id);
		let path = '/item/' + id
		let url = serverURL + path
		console.log(url)

		try{
			const response = await fetch(url, {method: "DELETE"});
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			console.log(newData)
			// return newData.item
        }
		catch (err) {
			console.log("Something went wrong!", err);
			alert(err);
			return null;
		}
	}

	// functions to call right when the app start.
	useEffect(() => {getAll();}, [getAll]); // populate the grid
	// get the price history info for all items at the very start. will also do this whenever the getPrice function is called.

  return (
    <div className="App">
		<AppBar position="static" color="primary">
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Box display="flex" alignItems="center" gap={2}>
					<img src={siteLogo} alt="mrkttrak" style={{ height: 35 }}/>

					<Typography variant="h6" fontWeight="bold">
						RoTrack
					</Typography>
				</Box>

			</Toolbar>
		</AppBar>


		<Box sx={{display: "flex", alignItems: "center", gap: 2, padding: 2, borderBottom: "1px solid rgba(255,255,255,0.2)"}}>
			{/* refresh button */}
			<IconButton onClick={getAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
				<RefreshIcon />
			</IconButton>
			
			<TextField 
				id="outlined-controlled" 
				sx={{input: { color: "white" }, label: {color: "white"}, border: "1px solid rgba(0,0,255,0)", "&:hover": { backgroundColor: "secondary.dark" }}}
				label="Search here" 
				value={searchValue} 
				onChange={(event) => {setSearchValue(event.target.value);}}
			/>

			{/* search catalog*/}
			<Button onClick={() => handleSearch()} variant="outlined">Search</Button>

			{/* catalog search results */}
			{showCatalog && catalogData.length > 0 && (
				<Box
					sx={{
						width: "30%", maxHeight: 100, // allows to see at least 3 items
						overflowY: "auto",
						// mt: 3, // top space above
						border: "3px solid #ffffff",
						borderRadius: 12,
						backgroundColor: "#006CC5",
						color: "#000000",
						
						// hiding the scroll bar
						"&::-webkit-scrollbar": {display: "none",}, scrollbarWidth: "none", msOverflowStyle: "none",
					}}
				>
					{catalogData.map((item) => (
					<Box
						key={item.id} 
						onClick={() => handleItemClick(item.id)}
						sx={{padding: 2, cursor: "pointer", borderBottom: "1px solid #333", "&:hover": {backgroundColor: "secondary.dark", color: "#ffffff"},}}
					>
						{item.name}
					</Box>
					))}
				</Box>
			)}
		</Box>
		

		<Box 
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					// allows grid sizing per row based on screen size
					xs: 'repeat(1, 1fr)',
					sm: 'repeat(2, 1fr)',
					md: 'repeat(3, 1fr)',
					lg: 'repeat(4, 1fr)' 
				},
				gap: 2, 
				mt: 4,
				paddingX: 2
			}}
		>
		{gridData.map((item) => (
			<Card
				key={item.id}
				sx={{backgroundColor: "#222", color: "white", width: "100%", overflow: "hidden"}}
			>
					<CardMedia component="img" height="420" image={item.icon} alt={item.name}/>
					
					<CardContent>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							{item.limited && 
							<Button size="small" sx={{mr: 1.5, flexShrink: 0, color: "#ffffff", borderColor: "#00cf00", borderWidth:"0px", backgroundColor: "#00cf00", "&:hover": { backgroundColor: "#00cf00", color: "#ffffff", borderColor: "#ffffff" }}} variant="outlined">
								Limited
							</Button>}

							<Typography 
								variant="h6" 
								sx={{
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									flexGrow: 1, 
									marginRight: 1 
								}}
							>
								{item.name}
							</Typography>							

							<IconButton 
								component="a"
								href={`https://www.roblox.com/catalog/${item.id}`}
								target="_blank" // opens in new tab
								rel="noopener noreferrer" // security
								sx={{color: "#ffffff", "&:hover": { backgroundColor: "#ffffff", color: "#000000" }}}>
								<OpenInNewIcon />
							</IconButton>

							<IconButton
								size="small"
								onClick={() => handleToggleExpand(item.id)}
								sx={{color: "#ffffff", "&:hover": { backgroundColor: "#ffffff", color: "#000000" }}}
							>
								{expanded[item.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
							</IconButton>
						</Box>

						<Collapse in={expanded[item.id]} timeout="auto" unmountOnExit>
							<Box mt={2}>

								<Box display="flex" justifyContent="space-between" alignItems="center">
									<Button size="small" sx={{color: "#9090cf", borderColor: "#9090cf", borderWidth:"0px", "&:hover": { backgroundColor: "#9090cf", color: "#ffffff", borderColor: "#ffffff" }}} variant="outlined" onClick={() => handleGetPrice(item.id)}>
										Get Price
									</Button>

									<Button
										variant="outlined"
										size="small"
										sx={{color: "#EF4444", borderColor: "#EF4444", borderWidth:"0px", "&:hover": { backgroundColor: "#EF4444", color: "#ffffff", borderColor: "#ffffff" }}}
										onClick={() => handleDeleteItem(item.id)}
									>
										Delete
									</Button>
								</Box>

								{prices[item.id] && <Typography variant="body2" mt={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									Best Price: {prices[item.id]}
								</Typography>}

								{item.quantity !== "0" && <Typography variant="body2" mt={1}>
									Quantity: {item.quantity}
								</Typography>}

								<Typography variant="body2" mt={1} sx={{wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal"}}>
									Description: {item.description}
								</Typography>
								
								{(item.upload_date !== null) && <Typography variant="body2" mt={1}>
									Created {item.upload_date}
								</Typography>}

								{priceHistory[item.id] && (
									<Box>
										<LineChart sx={{"& .MuiChartsLegend-label": {fill: "#ffffff"}}}
											xAxis={[
											{
												data: priceHistory[item.id].created_at,
												scaleType: "time",
												valueFormatter: (date) =>
													date.toLocaleDateString(undefined, {
													month: "short",
													day: "numeric"
												}),
												tickLabelStyle: { fill: "#ffffff" },
												labelStyle: { fill: "#ffffff" }
											}
											]}
											yAxis={[{
												id: "linearAxis",
												scaleType: "linear",
												position: "left",
												tickLabelStyle: { fill: "#ffffff" },
												labelStyle: { fill: "#ffffff" }
											}
											]}
											series={[{yAxisId: 'linearAxis', data: priceHistory[item.id].prices}]}
											height={250}
										/>
									</Box>
								)}
							</Box>
						</Collapse>
					</CardContent>
				</Card>
		))}
		</Box>
    </div>
  );
}

export default App;
