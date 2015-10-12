var checkFolder = require('..').checkFolder


checkFolder('default', 'to-check', function(err, good){

console.log(err, good);
})
