import unify from '../main.js';

class MatchString extends unify.Unifier {
  constructor(regexp, matches, props) {
    super();
    this.regexp = regexp;
    this.matches = matches;
    this.props = props;
  }

  unify(val, ls, rs) {
    if (unify.isVariable(val)) {
      // cannot match with an unbound variable
      return false;
    }
    const result = this.regexp.exec('' + val);
    if (result) {
      if (this.matches) {
        ls.push(this.matches);
        rs.push(Array.prototype.slice.call(result, 0));
      }
      if (this.props) {
        ls.push(this.props);
        rs.push({index: result.index, input: result.input});
      }
    }
    return result;
  }
}

const matchString = (regexp, matches, props) => new MatchString(regexp, matches, props);

export default matchString;
