// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawn } = require('child_process');

const node = spawn('npm', ['run', 'node'], {
  stdio: 'inherit',
  shell: true
});

setTimeout(() => {
  console.log('Deploying contracts...');
  const deploy = spawn('npm', ['run', 'deploy-orakul-local'], {
    stdio: 'inherit',
    shell: true
  });

  deploy.on('close', (code) => {
    console.log(`Deploy script exited with code ${code}`);
    
    if (code === 0) {
      console.log('Running auto-fulfill-vrf...');
      const autoFulfill = spawn('npm', ['run', 'auto-fulfill-vrf'], {
        stdio: 'inherit',
        shell: true
      });
      
      autoFulfill.on('close', (autoFulfillCode) => {
        console.log(`Auto-fulfill-vrf script exited with code ${autoFulfillCode}`);
        console.log('Node is still running. Press Ctrl+C to stop.');
      });
    } else {
      console.log('Deployment failed, skipping auto-fulfill-vrf');
    }
  });
}, 3000); 

console.log('Starting Hardhat node...');

process.on('SIGINT', () => {
  node.kill();
  process.exit();
});