System.config({
  map: {
    bootstrap: './',
    chance: '/vendor/'
  },
  packages: {
    bootstrap: {
      main: './bootstrap.js',
      defaultExtension: 'js'
    },
    chance: {
      main: './chance.min.js'
    }
  }
});


System.import('bootstrap').catch(console.error);