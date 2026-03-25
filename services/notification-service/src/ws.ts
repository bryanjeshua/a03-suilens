const clients = new Set<any>();

export function addClient(ws: any) {
  clients.add(ws);
}

export function removeClient(ws: any) {
  clients.delete(ws);
}

export function broadcast(data: any) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    try {
      client.send(message);
    } catch {
      clients.delete(client);
    }
  }
}
