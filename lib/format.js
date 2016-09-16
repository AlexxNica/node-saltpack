// Generated by IcedCoffeeScript 108.0.11
(function() {
  var DeformatStream, FormatStream, chars_per_word, newline, noop, punctuation, space, stream, util, words_per_line,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  stream = require('keybase-chunk-stream');

  util = require('./util');

  space = new Buffer(' ');

  newline = new Buffer('\n');

  punctuation = new Buffer('.');

  words_per_line = 200;

  chars_per_word = 15;

  noop = function() {};

  exports.FormatStream = FormatStream = (function(_super) {
    __extends(FormatStream, _super);

    FormatStream.prototype._format = function(chunk, cb) {
      var res;
      if (chunk.length < this.block_size) {
        return cb(null, chunk);
      }
      res = new Buffer('');
      if (!this._header_written) {
        res = Buffer.concat([this._header, punctuation, space]);
        this._header_written = true;
      }
      this._word_count++;
      if (this._word_count !== 200) {
        res = Buffer.concat([res, chunk, space]);
      } else {
        res = Buffer.concat([res, chunk, newline]);
        this._word_count = 0;
      }
      return cb(null, res);
    };

    FormatStream.prototype.flush_append = function(cb) {
      return cb(null, Buffer.concat([punctuation, space, this._footer, punctuation]));
    };

    function FormatStream(_arg) {
      var brand, _brand;
      brand = _arg.brand;
      if (brand != null) {
        _brand = brand;
      } else {
        _brand = 'KEYBASE';
      }
      this._header = new Buffer("BEGIN" + space + _brand + space + "SALTPACK" + space + "ENCRYPTED" + space + "MESSAGE");
      this._footer = new Buffer("END" + space + _brand + space + "SALTPACK" + space + "ENCRYPTED" + space + "MESSAGE");
      this._header_written = false;
      this._word_count = 0;
      FormatStream.__super__.constructor.call(this, {
        transform_func: this._format,
        block_size: chars_per_word,
        readableObjectMode: false
      });
    }

    return FormatStream;

  })(stream.ChunkStream);

  exports.DeformatStream = DeformatStream = (function(_super) {
    var _body_mode, _footer_mode, _header_mode, _strip, _strip_re;

    __extends(DeformatStream, _super);

    _header_mode = 0;

    _body_mode = 1;

    _footer_mode = 2;

    _strip_re = /[>\n\r\t ]/g;

    _strip = function(chunk) {
      return chunk = new Buffer(chunk.toString().replace(_strip_re, ""));
    };

    DeformatStream.prototype._deformat = function(chunk, cb) {
      var expected_footer, footer, index, re;
      chunk = Buffer.concat([this._partial, chunk]);
      this._partial = new Buffer('');
      if (this._mode === _header_mode) {
        index = chunk.indexOf(punctuation[0]);
        if (index !== -1) {
          re = /[>\n\r\t ]*BEGIN[>\n\r\t ]+([a-zA-Z0-9]+)?[>\n\r\t ]+SALTPACK[>\n\r\t ]+(ENCRYPTED[>\n\r\t ]+MESSAGE)|(SIGNED[>\n\r\t ]+MESSAGE)|(DETACHED[>\n\r\t ]+SIGNATURE)[>\n\r\t ]*/;
          this._header = chunk.slice(0, index);
          if (!re.test(this._header)) {
            return cb(new Error("Header failed to verify!"), null);
          }
          chunk = chunk.slice(index + punctuation.length);
          this._mode = _body_mode;
        } else {
          this._partial = chunk;
          return cb(null, null);
        }
      }
      if (this._mode === _body_mode) {
        index = chunk.indexOf(punctuation[0]);
        if (index === -1) {
          return cb(null, _strip(chunk));
        } else {
          this.push(_strip(chunk.slice(0, index)));
          chunk = chunk.slice(index + punctuation.length);
          this._mode = _footer_mode;
        }
      }
      if (this._mode === _footer_mode) {
        index = chunk.indexOf(punctuation[0]);
        if (index !== -1) {
          footer = chunk.slice(0, index);
          re = /[>\n\r\t ]*END[>\n\r\t ]+([a-zA-Z0-9]+)?[>\n\r\t ]+SALTPACK[>\n\r\t ]+(ENCRYPTED[>\n\r\t ]+MESSAGE)|(SIGNED[>\n\r\t ]+MESSAGE)|(DETACHED[>\n\r\t ]+SIGNATURE)[>\n\r\t ]*/;
          expected_footer = Buffer.concat([new Buffer('END'), _strip(this._header).slice(5)]);
          if (!(re.test(footer) && util.bufeq_secure(_strip(footer), expected_footer))) {
            return cb(new Error("Footer failed to verify! " + (_strip(footer)) + " != " + expected_footer), null);
          }
          this._mode = -1;
          return cb(null, null);
        } else {
          this._partial = chunk;
        }
      }
      if (this._mode === -1) {
        return cb(null, null);
      }
    };

    function DeformatStream(_arg) {
      var brand;
      brand = _arg.brand;
      this._header = null;
      this._mode = _header_mode;
      this._partial = new Buffer('');
      DeformatStream.__super__.constructor.call(this, {
        transform_func: this._deformat,
        block_size: 2048,
        readableObjectMode: false
      });
    }

    return DeformatStream;

  })(stream.ChunkStream);

}).call(this);