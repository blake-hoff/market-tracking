import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import {Grid, Card, CardMedia, CardContent, Typography, Box} from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';

const App = () => {
    const [gridData, setGridData] = useState([]);
	const [prices, setPrices] = useState({});

    let link = 'http://127.0.0.1:5000/api'

	const handleGetPrice = async (id) => {
		try {
			const price = await getPrice(id);
			console.log(price)

			setPrices(prev => ({
					...prev,
					[id]: price
				}));
				} catch (err) {
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

	useEffect(() => {getAll();}, [getAll]);

  return (
    <div className="App">
			<header className="App-header">
				<img src={'https://tr.rbxcdn.com/180DAY-8b91ad6a742a8bfb3b12c6cff5e3cc54/110/110/Hat/Png/noFilter'} alt="logo"/>

				{/* <a
					className="App-link"
					href="https://www.roblox.com/catalog"
					target="_blank"
					rel="noopener noreferrer"
				>
					Roblox Catalog
				</a> */}

				<Box display="flex" justifyContent="left" mb={3}>
					<Button variant="contained" onClick={getAll}>Refresh</Button>
					{/* <IconButton color="secondary" onClick={getAll}>
						<RefreshIcon />
					</IconButton> */}
				</Box>
					
				<Grid container spacing={2} mt={4} justifyContent={'center'}>
				{gridData.map((item) => (
					<Grid item xs={12} sm={6} md={4} key={item.id}>
						<Card sx={{ backgroundColor: "#222", color: "white" }}>
							<CardMedia component="img" height="420" image={item.icon} alt={item.name}/>
							
							<CardContent>
								<Typography variant="h6">
									{item.name} (ID: {item.id})
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

			</header>

    </div>
  );
}

export default App;
