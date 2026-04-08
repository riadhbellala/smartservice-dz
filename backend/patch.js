const fs = require('fs');
let code = fs.readFileSync('src/controllers/providerDashboardController.ts', 'utf8');

code = code.replace(
  /} catch \(error\) {/g,
  `} catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\\nError: ' + String(error.message));`
);

fs.writeFileSync('src/controllers/providerDashboardController.ts', code);
