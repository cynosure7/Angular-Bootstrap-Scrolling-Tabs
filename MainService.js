;(function () {
  'use strict';

  var tabs = [
    { paneId: 'tab01', title: 'Tab 1', content: 'Tab 1 Content', active: true},
    { paneId: 'tab02', title: 'Tab 2', content: 'Tab 2 Content', active: false},
    { paneId: 'tab03', title: 'Tab 3', content: 'Tab 3 Content', active: false},
    { paneId: 'tab04', title: 'Tab 4', content: 'Tab 4 Content', active: false},
    { paneId: 'tab05', title: 'Tab 5', content: 'Tab 5 Content', active: false},
    { paneId: 'tab06', title: 'Tab 6', content: 'Tab 6 Content', active: false},
    { paneId: 'tab07', title: 'Tab 7', content: 'Tab 7 Content', active: false},
    { paneId: 'tab08', title: 'Tab 8', content: 'Tab 8 Content', active: false},
    { paneId: 'tab09', title: 'Tab 9', content: 'Tab 9 Content', active: false}
  ];


  function MainService($timeout) {
    var svc = this;

    svc.data = {
      tabs: tabs
    };
  }

  MainService.$inject = ['$timeout'];

  angular.module('myapp').service('MainService', MainService);
}());