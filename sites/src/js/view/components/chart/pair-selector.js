import React     from "react"
import MUI       from "material-ui"

const DropDownMenu = MUI.DropDownMenu;
const emptyItems   = [{text:""}];

export default class PairSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      items: emptyItems
    };
  }

  componentWillMount() {
    this.pairs().addObserver("propertyChanged",
      this.onPairsPropertyChanged.bind(this), this);

    this.updateState();
  }
  componentWillUnmount() {
    this.pairs().removeAllObservers(this);
  }

  onPairsPropertyChanged(n, e) {
    if (e.key !== "pairs") return;
    this.updateState();
  }

  updateState() {
    const items = this.convertPairsToMenuItems(this.pairs().pairs);
    const selectedIndex = this.getSelectedIndex(this.preferences().preferredPair, items);
    this.setState({
      items : items,
      selectedIndex:selectedIndex
    });
  }

  convertPairsToMenuItems(pairs) {
    if (pairs.length <= 0) return emptyItems;
    return pairs.map((item) => {
      return {text:item.name};
    });
  }

  render() {
    return (
      <DropDownMenu
        menuItems={this.state.items}
        selectedIndex={this.state.selectedIndex}
        onChange={this.onChange.bind(this)}/>
    );
  }

  onChange(e, selectedIndex, menuItem) {
    this.preferences().preferredPair = this.state.items[selectedIndex].text;
    this.setState({selectedIndex: selectedIndex});
  }

  getSelectedIndex(pairName, items) {
    const index = items.findIndex((item)=>item.text === pairName);
    return index === -1 ? 0 : index;
  }

  preferences() {
    return this.context.application.preferences;
  }
  pairs() {
    return this.context.application.pairs;
  }
}

PairSelector.contextTypes = {
  application: React.PropTypes.object.isRequired
};