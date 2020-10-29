const replace = (tmpl, env) =>
  tmpl.replace(/\$+\{([^\}\s\r\n]+)\}/g, (match, name) => (match.length - name.length > 3 ? match.substring(1) : env.values[name]));

export default replace;
