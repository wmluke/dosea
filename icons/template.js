const template = (variables, { tpl }) => {
    variables.componentName = variables.componentName + "ChartIcon";

    return tpl`
${variables.imports};

${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);
 
${variables.exports};
`;
};

module.exports = template;
