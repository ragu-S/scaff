import React from 'react';
import PropTypes from 'prop-types';
{{#if test}}{{animate}}{{/if}}
export default class {{componentName}} extends React.Component {

  {{#if staticProps}}
  {{#jsObject}}{{staticProps}}{{/jsObject}}
  {{/if}}
  constructor(props) {
    super(props);

    this.state = {}
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps, nextState) {}
  {{#if test}}{{transitionGroupHooks}}{{/if}}
  componentWillUnmount() {}

  render() {
    <div className={`{{componentName}} ${this.props.className}`}>
        This is {{componentName}} (React component)
    </div>
  }
}