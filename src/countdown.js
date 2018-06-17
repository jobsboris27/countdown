/**
 Version: 1.8.1
 Author: Boris Mukhin
 Docs: http://jobsboris27.github.io/coundown.git
 */
(function (name, definition) {
  if (typeof define === "function" && define.amd) {
    define([name], definition);
  } else if (typeof module === "object" && module.exports) {
    module.exports = definition();
  } else {
    const gl = this;
    gl[name] = definition();
  }
})("Countdown", function () {
  "use strict";

  function _changed(node1, node2) {
    return typeof node1 !== typeof node2 ||
      typeof node1 === 'string' && node1 !== node2 ||
      node1.type !== node2.type
  }

  function _createElement(node) {
    if (typeof node === 'string') {
      return document.createTextNode(node);
    }
    const $el = document.createElement(node.type);
    node.class && $el.setAttribute("class", node.class);

    node.children
      .map(_createElement)
      .forEach($el.appendChild.bind($el));
    return $el;
  }

  function _updateElement($parent, newNode, oldNode, _index) {
    let index = _index || 0;
    if (!oldNode) {
      $parent.appendChild(
        _createElement(newNode)
      );
    } else if (!newNode) {
      $parent.removeChild(
        $parent.childNodes[index]
      );
    } else if (_changed(newNode, oldNode)) {
      $parent.replaceChild(
        _createElement(newNode),
        $parent.childNodes[index]
      );
    } else if (newNode.type) {
      const newLength = newNode.children.length;
      const oldLength = oldNode.children.length;
      for (let i = 0; i < newLength || i < oldLength; i++) {
        _updateElement(
          $parent.childNodes[index],
          newNode.children[i],
          oldNode.children[i],
          i
        );
      }
    }
  }


  const _isObjectEmpty = function (obj) {
    return obj && Object.keys(obj).length === 0;
  };

  function Countdown(settings) {
    const _defaultSettings = {
      outputContainer: document.body,
      view: "",
      endDate: {},
      onStart: function () { },
      onStop: function () { },
      onReset: function () { },
    };

    if (!(this instanceof Countdown)) {
      return new Countdown(settings);
    }

    this.settings = Object.assign(_defaultSettings, settings);

    if (_isObjectEmpty(this.settings.endDate)) {
      console.warn("property 'endDate' is empty");
      return;
    }

    const _year = this.settings.endDate.year || 2090;
    const _month = this.settings.endDate.month && this.settings.endDate.month - 1 || 11;
    const _day = this.settings.endDate.day || 12;
    const _hour = this.settings.endDate.hour || 12;
    const _minutes = this.settings.endDate.minutes || 12;
    const _sec = this.settings.endDate.sec || 12;
    const _endDate = new Date();

    _endDate.setFullYear(_year);
    _endDate.setMonth(_month);
    _endDate.setDate(_day);
    _endDate.setHours(_hour);
    _endDate.setMinutes(_minutes);
    _endDate.setSeconds(_sec);

    this._endDate = _endDate;

    this.createElements();
    this.startTick();
  }

  Countdown.prototype.dateDiff = function (dt1, dt2) {
    /*
     * setup 'empty' return object
     */
    let ret = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    /*
     * If the dates are equal, return the 'empty' object
     */
    if (dt1 == dt2) return ret;

    /*
     * ensure dt2 > dt1
     */
    if (dt1 > dt2) {
      let dtmp = dt2;
      dt2 = dt1;
      dt1 = dtmp;
    }

    const distance = dt2.getTime() - dt1.getTime();
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    ret['hours'] = hours;
    ret['minutes'] = minutes;
    ret['seconds'] = seconds;
    /*
     * First get the number of full years
     */

    let year1 = dt1.getFullYear();
    let year2 = dt2.getFullYear();

    let month1 = dt1.getMonth();
    let month2 = dt2.getMonth();

    let day1 = dt1.getDate();
    let day2 = dt2.getDate();

    /*
     * Set initial values bearing in mind the months or days may be negative
     */

    ret['years'] = year2 - year1;
    ret['months'] = month2 - month1;
    ret['days'] = day2 - day1;

    /*
     * Now we deal with the negatives
     */

    /*
     * First if the day difference is negative
     * eg dt2 = 13 oct, dt1 = 25 sept
     */
    if (ret['days'] < 0) {
      /*
       * Use temporary dates to get the number of days remaining in the month
       */
      let dtmp1 = new Date(dt1.getFullYear(), dt1.getMonth() + 1, 1, 0, 0, -1);

      let numDays = dtmp1.getDate();

      ret['months'] -= 1;
      ret['days'] += numDays;

    }

    /*
     * Now if the month difference is negative
     */
    if (ret['months'] < 0) {
      ret['months'] += 12;
      ret['years'] -= 1;
    }

    return ret;
  };

  Countdown.prototype.startTick = function () {
    const intervalID = setInterval(function (coundown) {
      const now = new Date();
      const distance = coundown._endDate.getTime() - now.getTime();
      
      coundown.createElements();

      if (distance < 0) {
        clearInterval(intervalID);
        alert("Stop countdown");
      }
    }, 1000, this);
  };

  Countdown.prototype.createElements = function () {
    const now = new Date();
    const dateDiff = this.dateDiff(this._endDate, now);
    const container = {
      type: "div",
      class: "simple-countdown__container",
      children: []
    };

    Object.keys(dateDiff).forEach(function (key) {
      const content = dateDiff[key];
      const item = {
        type: "div",
        class: "simple-countdown__item",
        children: [
          {
            type: "span",
            children: [
              "" + (content + 1)
            ]
          },
          {
            type: "span",
            children: [
              "" + content
            ]
          },
          {
            type: "span",
            children: [
              "" + (content - 1)
            ]
          },
        ]
      }

      container.children.push(item);
    });

    const structure = {
      type: "div",
      class: "simple-countdown",
      children: [container]
    }

    const $root = this.settings.outputContainer;
    
    this._vOldStructure ? _updateElement($root, this._vOldStructure, structure) : _updateElement($root, structure);
    this._vOldStructure = structure;
  }

  return Countdown;
});
