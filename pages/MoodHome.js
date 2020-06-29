import React from 'react';
import { Text, View } from 'react-native';
import Mytextinput from '../components/Mytextinput.js';
import Mybutton from '../components/Mybutton.js';

export default class OnlineRules extends React.Component {
  constructor(props) {
    super(props);
  }
  localG = () => {
    
  };
  onlineG = () => {
    
  };
  render() {
    return (
      <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        flexDirection: 'column',
      }}
      >
        <Mybutton
          title="Local Game*"
          customClick={this.localG.bind(this)}
        />
        <Mybutton
          title="Online Game"
          customClick={this.onlineG.bind(this)}
        />
      </View>
    );
  }
}