let _total = 0,
  _errors = 0,
  _current = null,
  _local = 0;

const SHOW_FAILED_TEST_CODE = true;

const res = (msg, isError) => {
  ++_local;
  ++_total;
  if (isError) {
    ++_errors;
    console.log(msg);
  }
};

export const submit = (msg, success) => {
  if (success) {
    res('Success: ' + msg + ' --- in ' + _current + ', #' + (_local + 1));
  } else {
    res('Failed: ' + msg + ' --- in ' + _current + ', #' + (_local + 1), true);
  }
};

const quoteString = text => text.replace(/['"\\]/g, '\\$&');
export const TEST = condition => "submit('" + quoteString(condition) + "', (" + condition + '))';

export const runAllTests = async tests => {
  _total = _errors = 0;
  let exceptionFlag = false;
  console.log('Starting tests...');
  for (let i = 0, l = tests.length; i < l; ++i) {
    _current = tests[i].name;
    _local = 0;
    try {
      await tests[i]();
    } catch (e) {
      exceptionFlag = true;
      console.log('Unhandled exception in test #' + i + ' (' + tests[i].name + '): ' + e.message);
      if (e.stack) {
        console.log('Stack: ', e.stack);
      }
      if (SHOW_FAILED_TEST_CODE) {
        console.log('Code: ', tests[i].toString());
      }
    }
  }
  console.log(_errors ? 'Failed ' + _errors + ' out of ' + _total + ' tests.' : 'Finished ' + _total + ' tests.');
  if (typeof process != 'undefined') {
    process.exit(_errors || exceptionFlag ? 1 : 0);
  } else if (typeof window != 'undefined' && window) {
    if (typeof window.callPhantom == 'function') {
      window.callPhantom(_errors || exceptionFlag ? 'failure' : 'success');
    }
  }
};
