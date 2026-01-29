const http = require('http');

const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/tags',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ Ollama connection successful!');
            try {
                const parsed = JSON.parse(data);
                const models = parsed.models || [];
                console.log('\nAvailable Models:');
                models.forEach(m => console.log(`- ${m.name}`));

                const hasLlama = models.some(m => m.name.includes('llama3.2'));
                if (hasLlama) {
                    console.log('\n✅ "llama3.2" model found.');
                } else {
                    console.log('\n⚠️ "llama3.2" model NOT found. Run `ollama pull llama3.2`');
                }
            } catch (e) {
                console.error('Error parsing response:', e);
            }
        } else {
            console.log('❌ Ollama responded with error status.');
            console.log(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Connection failed: ${e.message}`);
    console.error('Make sure Ollama is running (try `ollama serve` in a terminal).');
});

req.end();
