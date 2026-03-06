import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import {Grid, Card, CardMedia, CardContent, Typography, Box, IconButton, AppBar, Toolbar, TextField} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Collapse from "@mui/material/Collapse";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LineChart } from '@mui/x-charts/LineChart';

const App = () => {
    const [gridData, setGridData] = useState([]);
	const [prices, setPrices] = useState({});
  	const [itemID, setItemID] = React.useState('');
	const [expanded, setExpanded] = useState({});

	const [searchValue, setSearchValue] = useState('');
	const [catalogData, setCatalogData] = useState([]); // for the catalog scrollable window
	const [showCatalog, setShowCatalog] = useState(false);

	const [priceHistory, setPriceHistory] = useState({}); // for the price history of all items. only gets populated/updated as you press getPrice for individual items.

    let link = 'http://127.0.0.1:5000/api'

	const handleToggleExpand = (id) => {
		setExpanded(prev => ({
			...prev,
			[id]: !prev[id]
		}));
		// also get the price history
		getPriceHistory(id);
		// console.log(priceHistory[id]);
	};

	const handleGetPrice = async (id) => {
		try {
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

	const handleItemClick = async (id) => {
		try {
			// setItemID(id)
			const response = await getItemDetails(id);
			console.log(response);

			// setItemID('');
			getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	// clear the current inputted itemID
	// add the item using the api
	const handleAddItem = async () => {
		try {
			const response = await getItemDetails(itemID);
			console.log(response);

			setItemID('');
			getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleSearch = async () => {
		try {
			const response = await searchCatalog(searchValue);
			// console.log(response);

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
		let url = link + path;

		try {
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			setGridData(newData.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [link]);

	async function searchCatalog(keyword) {
		let path = '/search-roblox-catalog?keyword=' + keyword
		let url = link + path
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
		let url = link + path
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
		let url = link + path
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
		let url = link + path;
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

	// functions to call right when the app start.
	useEffect(() => {getAll();}, [getAll]); // populate the grid
	// get the price history info for all items at the very start. will also do this whenever the getPrice function is called.

  return (
    <div className="App">
		<AppBar position="static" color="primary">
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Box display="flex" alignItems="center" gap={2}>
					<img src="https://tr.rbxcdn.com/180DAY-8b91ad6a742a8bfb3b12c6cff5e3cc54/420/420/Hat/Png/noFilter" alt="mrkttrak" style={{ height: 35 }}/>

					<Typography variant="h6" fontWeight="bold">
						RoTrack
					</Typography>
				</Box>

			</Toolbar>
		</AppBar>



		<Box sx={{display: "flex", alignItems: "center", gap: 2, padding: 2, borderBottom: "1px solid rgba(255,255,255,0.1)"}}>
			{/* refresh button */}
			<IconButton onClick={getAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
				<RefreshIcon />
			</IconButton>

			{/* add item */}
			<Button onClick={() => handleAddItem()} variant="outlined">Add Item</Button>
			
			<TextField 
				id="outlined-controlled" 
				sx={{input: { color: "white" }, label: {color: "white"}, border: "1px solid rgba(0,0,255,0)", "&:hover": { backgroundColor: "secondary.dark" }}}
				label="Input ID" 
				value={itemID} 
				onChange={(event) => {setItemID(event.target.value);}}
			/>

			{/* search catalog*/}
			<Button onClick={() => handleSearch()} variant="outlined">Search</Button>
			
			<TextField 
				id="outlined-controlled" 
				sx={{input: { color: "white" }, label: {color: "white"}, border: "1px solid rgba(0,0,255,0)", "&:hover": { backgroundColor: "secondary.dark" }}}
				label="Search here" 
				value={searchValue} 
				onChange={(event) => {setSearchValue(event.target.value);}}
			/>
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
				
				// hidiing the scroll bar
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
		



		<Grid container spacing={2} mt={4} justifyContent={'center'}>
		{gridData.map((item) => (
			<Grid item xs={12} sm={6} md={4} key={item.id}>
				<Card
				sx={{backgroundColor: "#222", color: "white", width: "100%", maxWidth: 400, overflow: "hidden"}}>
					<CardMedia component="img" height="400" image={item.icon} alt={item.name}/>
					
					<CardContent>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="h6">
							{item.name}
							</Typography>

							<IconButton
								size="small"
								onClick={() => handleToggleExpand(item.id)}
								sx={{ color: "white" }}
							>
							{expanded[item.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
							</IconButton>
						</Box>

						<Collapse in={expanded[item.id]} timeout="auto" unmountOnExit>
							<Box mt={2}>
								<Typography variant="body2">
									ID: {item.id}
								</Typography>

								<Typography variant="body2" mt={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<span>Price:</span>

									{prices[item.id] !== undefined ? (
										<span>{prices[item.id]}</span>
									) : null}

									<Button size="small" variant="outlined" onClick={() => handleGetPrice(item.id)}>
										Get Price
									</Button>
								</Typography>

								<Typography variant="body2" mt={1}>
									Quantity: {item.quantity}
								</Typography>

								<Typography variant="body2" mt={1} sx={{wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal"}}>
									Description: {item.description}
								</Typography>

								{priceHistory[item.id] && (
									<Box>
										<LineChart sx={{"& .MuiChartsLegend-label": {fill: "#ffffff"}}}
											xAxis={[
											{
												data: priceHistory[item.id].created_at,
												// tickLabelStyle: { fill: "#ffffff" },
												// labelStyle: { fill: "#ffffff" }
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
											series={[{yAxisId: 'linearAxis', data: priceHistory[item.id].prices, label: 'Price'}]}
											height={250}
										/>
									</Box>
								)}
							</Box>
						</Collapse>
					</CardContent>
				</Card>
			</Grid>
		))}
		</Grid>
    </div>
  );
}

export default App;
