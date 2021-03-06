const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8989 });

const users = [];

const broadcast = (data, ws) => {
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN && client !== ws) {
			client.send(JSON.stringify(data));
		}
	});
};

wss.on('connection', (ws) => {
	console.log('Client connected...');
	let index;
	ws.on('message', (message) => {
		const data = JSON.parse(message);
		switch (data.type) {
			case 'ADD_USER': {
				index = users.length;
				users.push({ name: data.name, id: index + 1 });
				ws.send(
					JSON.stringify({
						type: 'USERS_LIST',
						users,
					}),
				);
				broadcast(
					{
						type: 'USERS_LIST',
						users,
					},
					ws,
				);
				break;
			}
			case 'ADD_MESSAGES':
				broadcast(
					{
						type: 'ADD_MESSAGES',
						message: data.message,
						author: data.author,
					},
					ws,
				);
				break;
			default:
				break;
		}
	});
	ws.on('close', () => {
		console.log('Client disconnected..');
		users.splice(index, 1);
		broadcast(
			{
				type: 'USERS_LIST',
				users,
			},
			ws,
		);
	});
});
