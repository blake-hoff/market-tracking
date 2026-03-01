import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import {Grid, Card, CardMedia, CardContent, Typography, Box, IconButton, AppBar, Toolbar, TextField} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from "@mui/icons-material/Settings";

const App = () => {
    const [gridData, setGridData] = useState([]);
	const [prices, setPrices] = useState({});
  	const [itemID, setItemID] = React.useState('');

    let link = 'http://127.0.0.1:5000/api'

	const handleGetPrice = async (id) => {
		try {
			const price = await getPrice(id);
			console.log(price)

			setPrices(prev => ({
				...prev,
				[id]: price
			}));
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
		} 
		catch (err) {
			console.error(err);
		}
	};

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

	useEffect(() => {getAll();}, [getAll]);

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

				<IconButton color="inherit">
					<SettingsIcon />
				</IconButton>

			</Toolbar>
		</AppBar>



		<Box sx={{display: "flex", alignItems: "center", gap: 2, padding: 2, borderBottom: "1px solid rgba(255,255,255,0.1)"}}>
			<IconButton onClick={getAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
				<RefreshIcon />
			</IconButton>

			{/* <Button onClick={() => getItemDetails(itemID)} variant="outlined">Add Item</Button> */}
			<Button onClick={() => handleAddItem()} variant="outlined">Add Item</Button>
			
			<TextField 
				id="outlined-controlled" 
				sx={{input: { color: "white" }, label: {color: "white"}, border: "1px solid rgba(0,0,255,0)", "&:hover": { backgroundColor: "secondary.dark" }}}
				label="Input ID" 
				value={itemID} 
				onChange={(event) => {setItemID(event.target.value);}}
			/>
			
			<Button variant="outlined">Search</Button>
			
			<Button variant="outlined">Toggle Source</Button>

		</Box>



		<Grid container spacing={2} mt={4} justifyContent={'center'}>
		{gridData.map((item) => (
			<Grid item xs={12} sm={6} md={4} key={item.id}>
				<Card sx={{ backgroundColor: "#222", color: "white" }}>
					{/* <img src="https://tr.rbxcdn.com/180DAY-8b91ad6a742a8bfb3b12c6cff5e3cc54/420/420/Hat/Png/noFilter" alt="mrkttrak" style={{ height: 250 }}/> */}
					<CardMedia component="img" height="400" image={item.icon} alt={item.name}/>
					
					<CardContent>
						<Typography variant="h6">
							{item.name}
						</Typography>

						<Typography variant="body2" sx={{ marginTop: 1 }}>
							ID: {item.id}
						</Typography>

						<Typography variant="body2" sx={{ marginTop: 1 }}>
							Price: {prices[item.id] !== undefined ? prices[item.id] : (
							<Button size="small" variant="outlined" onClick={() => handleGetPrice(item.id)}>
								Get Price
							</Button>
							)}
						</Typography>

						<Typography variant="caption">
							{/* Description: {item.description} */}
							Quantity: {item.quantity}
						</Typography>
					</CardContent>
				</Card>
			</Grid>
		))}
		</Grid>
    </div>
  );
}

export default App;
