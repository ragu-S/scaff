import React from 'react';
import PropTypes from 'prop-types';
{{animate}}

export default class {{componentName}} extends React.Component {
  {{propTypes}}
  {{defaultTypes}}

  constructor(props) {
    super(props);

    this.state = {}
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps, nextState) {}

  {{transitionGroupHooks}}

  componentWillUnmount() {}

  render() {
    <div className={`{{componentName}}${this.props.className}`}>
        This is {{componentName}} (React component)
    </div>
  }
}