import React from 'react';
import SVGContainer from '../../SVGContainer/SVGContainer';
import classnames from 'classnames';
import animate from 'gsap-promise';

export default class DropDown extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    selectedItemId: React.PropTypes.string,
    selectedColor: React.PropTypes.string,
    onItemClick: React.PropTypes.func
  }

  static defaultProps = {
    onItemClick() {}
  }

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  componentDidMount() {
    const listItems = this.list.querySelectorAll('.list-item-wrapper');
    animate.set(listItems, { opacity: 0 });
  }

  toggleOpenState = () => {
    const listItems = [ ...this.list.querySelectorAll('.list-item-wrapper') ];

    TweenMax.killTweensOf(listItems);

    if(!this.state.isOpen) {
      animate.staggerTo(listItems, 0.8, { delay: 0.15, opacity: 1, ease: Quad.easeOut }, 0.07);
    } else {
      animate.staggerTo(listItems.reverse(), 0.4, { delay: 0.2, opacity: 0, ease: Quad.easeOut }, 0.1);
    }

    return new Promise((resolve) => {
      this.setState({ isOpen: !this.state.isOpen }, resolve);
    });
  }

  handleItemChange = async (id) => {
    this.toggleOpenState();
    setTimeout(() => {
      this.props.onItemClick(id);
    }, 240);
  }

  render() {
    const selectableItems = this.props.items.filter(x => x.id !== this.props.selectedItemId);
    const selectedItem = this.props.items.find(x => x.id === this.props.selectedItemId);

    return (
      <div className={classnames("grid-dropdown", { open: this.state.isOpen })}>
        <div className="background-overlay" onClick={this.toggleOpenState} />
        <button
          className="dropdown-selected"
          style={{ color: this.props.selectedColor }}
          onClick={this.toggleOpenState}
          aria-label={__(selectedItem.name)}
          aria-haspopup="true"
          aria-expanded={this.state.isOpen}
        >
          <div className="center-content">
            <SVGContainer
              key={selectedItem.id}
              className={classnames("dropdown-svg", selectedItem.svg)}
              color={this.props.selectedColor}
              svg={selectedItem.svg}
            />
            {__(selectedItem.name)}
          </div>
          <SVGContainer
            className="arrow-svg"
            svg="pillbuttonArrow"
          />
        </button>
        <div className="dropdown-list-wrapper">
          <ul className="dropdown-list" ref={ ref => this.list = ref }>
          {
            selectableItems.map(item =>
              <li
                key={item.id}
                onClick={() => this.handleItemChange(item.id)}
              >
                <button className="list-item-wrapper" style={{ color: item.color }}>
                  <SVGContainer className={classnames("dropdown-svg", item.svg)} svg={item.svg} />
                  {__(item.name)}
                </button>
              </li>
            )
          }
          </ul>
        </div>
      </div>
    );
  }
}
