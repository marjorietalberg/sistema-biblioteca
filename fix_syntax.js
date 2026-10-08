const fs = require('fs');
let js = fs.readFileSync('public/js/dashboard.js', 'utf8');

// Find the mismatched brackets
// Let's just fix it automatically using string manipulation
js = js.replace(/        \}\);\n    \}\n\n    \}\n\}\);/g, '        });\n    }\n});');
js = js.replace(/        \}\);\n    \}\n\n    \}\n\}\);/g, '        });\n    }\n});'); // in case there's another

// Actually, the safest way is to use Esprima or Babel, but since we know the exact issue:
// The end of the file currently is:
/*
            } catch (err) {
                mostrarNotificacao('Erro de conexo.', 'error');
            }
        });
    }

    }
});

async function alterarPrivilegio(id, novoTipo) {
*/

js = js.replace(/        \}\);\n    \}\n\n    \}\n\}\);/g, '        });\n    }\n});');
js = js.replace(/        \}\);\n    \}\n\n    \}\n\}\);/g, '        });\n    }\n});');

fs.writeFileSync('public/js/dashboard.js', js, 'utf8');