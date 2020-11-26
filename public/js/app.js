var app = new Vue({
      el: '#app',
      data: {
        caption: 'Please provide a valid IOTA address.',
        waiting: false,
        address: "",
        addressValid: false,
        feedback: "",
        finished: false,
        receivedMessage: "",
        error: false,
        result : "",
        server: "",
        //explorer:"https://explorer.iota.org/chrysalis/",
        explorer:"https://tangle-explorer.dag.sh/chrysalis/",
        ready: false
      },
      methods:{
        requestTokens: function() {
          var self = this;
          self.waiting = true;
          self.recievedMessage = "";
          console.log('requesting');
          $.get('/api?address=' + self.address).then(function(res) {
            console.log('success!', res);
            self.waiting = false;
            self.finished = true;
            self.result = res.message + '\n\nMessage ID: ' + res.data.id;
            self.receivedMessage = res.data || "";
            self.false = true;
          }).fail(function(err) {
            console.log('epic fail', err);
            self.waiting = false;
            self.waiting = false;
            self.finished = true;
            self.result = err.responseJSON.message;
          });
        }
      },
      watch: {
        address: function (val) {
          if (this.address.length == 63 && this.address[3] == '1') {
              // matches
              console.log('valid')
              this.caption = "Address is valid."
              this.addressValid = true;

          } else {
              // doesn't match
              this.caption = 'Please provide a valid Chrysalis address (63 characters).';
              this.addressValid =  false;
          }

        },

      },
      mounted: function () {
        var self = this;
        self.ready = true;
      }      
  
});

