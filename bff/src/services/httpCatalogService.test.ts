import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { createHttpCatalogService } from './httpCatalogService';
import { UpstreamError } from '../types';

// The route tests run against fakes of the two ports. These run against a real HTTP server,
// because what they are checking - a deadline, and a body that is not what we asked for -
// only exists in the layer that speaks HTTP.
async function startServer(handler: (respond: (status: number, body: string) => void) => void) {
  const server: Server = createServer((_req, res) => {
    handler((status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(body);
    });
  });

  server.listen(0);
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    }),
  };
}

test('a catalog service that never answers becomes a 503 rather than a hung request', async (t) => {
  const server = await startServer(() => {
    // Deliberately never responds.
  });
  t.after(server.close);

  const catalog = createHttpCatalogService(server.url, 50);

  await assert.rejects(catalog.getCategories(), (error: unknown) => {
    assert.ok(error instanceof UpstreamError);
    assert.equal(error.status, 503);
    assert.deepEqual(error.errors, [{ field: '', code: 'catalog_unavailable' }]);
    return true;
  });
});

test('a 200 whose body is not a catalog becomes a 502', async (t) => {
  const server = await startServer((respond) => {
    respond(200, JSON.stringify([{ id: 'one', name: 'פירות וירקות' }]));
  });
  t.after(server.close);

  const catalog = createHttpCatalogService(server.url, 5000);

  await assert.rejects(catalog.getCategories(), (error: unknown) => {
    assert.ok(error instanceof UpstreamError);
    assert.equal(error.status, 502);
    assert.deepEqual(error.errors, [{ field: '', code: 'catalog_unavailable' }]);
    return true;
  });
});
