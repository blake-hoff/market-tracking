import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState } from 'react';
import {Table, TableBody, TableCell, TableRow, TableHead} from '@mui/material';

const App = () => {
    const [tableData, setTableData] = useState([]);
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

    async function getAll() { //view all items
		let path = '/item'
		let url = link + path
		console.log(url)

		try{
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			console.log(newData.items)
			setTableData(newData.items);
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
			<Button variant="contained" color="secondary" onClick={() => getAll()}>Refresh</Button>
			
			<Table className="tableInfo"   sx={{ width: '50%', '& .MuiTableCell-root': {color: 'white',}}}>
				<TableHead>
					<TableRow>
					<TableCell>ID</TableCell>
					<TableCell>Name</TableCell>
          			<TableCell>Price</TableCell>
					{/* <TableCell>Price</TableCell> */}
					<TableCell>Date Created</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
				{tableData.map((item) => (
					<TableRow key={item.id}>
					<TableCell>{item.id}</TableCell>
					<TableCell>{item.name}</TableCell>
					<TableCell>
						{prices[item.id] !== undefined ? (<>{prices[item.id]}</>) 
								: (<Button variant="outlined" onClick={() => handleGetPrice(item.id)}>Get Price</Button>)}
					</TableCell>
					{/* <TableCell>{(<Button variant="outlined" onClick={() => handleGetPrice(item.id)}>Get Price</Button>)}</TableCell> */}
					<TableCell>{item.date}</TableCell>
					</TableRow>
				))}
				</TableBody>
			</Table>

		</header>

    </div>
  );
}

export default App;
