const routes = [
  '/', '/sign-in', '/sign-up', '/dashboard', '/workspace', 
  '/studio', '/studio/new', '/analytics', '/settings', 
  '/export', '/pricing', '/about', '/api/v2/health'
];

async function testRoutes() {
  for (const route of routes) {
    try {
      const res = await fetch('http://localhost:3001' + route);
      console.log(`${route}: ${res.status} ${res.statusText}`);
    } catch (e) {
      console.log(`${route}: ERROR ${e.message}`);
    }
  }
}
testRoutes();
