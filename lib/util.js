// Generated by IcedCoffeeScript 108.0.11
(function() {
  var StreamToBuffer, crypto, iced, nacl, stream, __iced_k, __iced_k_noop,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  stream = require('stream');

  crypto = require('crypto');

  nacl = require('keybase-nacl');

  exports.bufeq_secure = function(x, y) {
    var check, i, ret;
    ret = (function() {
      var _i, _ref;
      if ((x == null) && (y == null)) {
        return true;
      } else if ((x == null) || (y == null)) {
        return false;
      } else if (x.length !== y.length) {
        return false;
      } else {
        check = 0;
        for (i = _i = 0, _ref = x.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          check |= x.readUInt8(i) ^ y.readUInt8(i);
        }
        return check === 0;
      }
    })();
    return ret;
  };

  exports.alice_and_bob = function(opts) {
    var alice, bob, force_js;
    if ((opts != null ? opts.force_js : void 0) != null) {
      force_js = opts.force_js;
    } else {
      force_js = false;
    }
    alice = nacl.alloc({
      force_js: force_js
    });
    bob = nacl.alloc({
      force_js: force_js
    });
    alice.genBoxPair();
    bob.genBoxPair();
    return {
      alice: alice,
      bob: bob
    };
  };

  exports.gen_recipients = function(pk) {
    var i, recipient_index, recipients_list, _i, _ref;
    recipient_index = Math.ceil(Math.random() * 20);
    recipients_list = [];
    for (i = _i = 0, _ref = recipient_index + 2; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      recipients_list.push(crypto.randomBytes(32));
    }
    recipients_list[recipient_index] = pk;
    return recipients_list;
  };

  exports.stream_random_data = function(strm, len, cb) {
    var amt, buf, err, expected_results, index, written, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    written = 0;
    expected_results = [];
    (function(_this) {
      return (function(__iced_k) {
        var _while;
        _while = function(__iced_k) {
          var _break, _continue, _next;
          _break = __iced_k;
          _continue = function() {
            return iced.trampoline(function() {
              return _while(__iced_k);
            });
          };
          _next = _continue;
          if (!(written < len)) {
            return _break();
          } else {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/home/mpcsh/keybase/node-saltpack/src/util.iced",
                funcname: "stream_random_data"
              });
              crypto.randomBytes(1, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    err = arguments[0];
                    return index = arguments[1];
                  };
                })(),
                lineno: 40
              }));
              __iced_deferrals._fulfill();
            })(function() {
              if (err) {
                throw err;
              }
              amt = (index[0] + 1) * 16;
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/home/mpcsh/keybase/node-saltpack/src/util.iced",
                  funcname: "stream_random_data"
                });
                crypto.randomBytes(amt, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      err = arguments[0];
                      return buf = arguments[1];
                    };
                  })(),
                  lineno: 45
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (err) {
                  throw err;
                }
                written += buf.length;
                expected_results.push(buf);
                return _next(strm.write(buf));
              });
            });
          }
        };
        _while(__iced_k);
      });
    })(this)((function(_this) {
      return function() {
        return cb(Buffer.concat(expected_results));
      };
    })(this));
  };

  exports.random_megabyte_to_ten = function() {
    return Math.floor((Math.pow(1024, 2)) * (Math.random() * 9) + 1);
  };

  exports.StreamToBuffer = StreamToBuffer = (function(_super) {
    __extends(StreamToBuffer, _super);

    function StreamToBuffer(options) {
      this.bufs = [];
      StreamToBuffer.__super__.constructor.call(this, options);
    }

    StreamToBuffer.prototype._write = function(chunk, encoding, cb) {
      this.bufs.push(chunk);
      return cb();
    };

    StreamToBuffer.prototype.getBuffer = function() {
      return Buffer.concat(this.bufs);
    };

    return StreamToBuffer;

  })(stream.Transform);

}).call(this);
