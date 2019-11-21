import React from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Button } from '@aragon/ui'
import styled from 'styled-components'
const { soliditySha3, toChecksumAddress } = require("web3-utils");

function App() {
  const { api, appState } = useAragonApi()
  const { isSyncing, controlledCourt, intercourtTokenValid, recepientValid, amountValid } = appState
  console.log(isSyncing)
  return (
    <Main>
      <BaseLayout>
        {isSyncing && <Syncing />}
        <H1>Judge Whom to Give Rewards</H1>
        <H2>Send any amount of tokens to recepients of your choice.</H2>
        <p>Controlled court: {controlledCourt}</p>
        <MyForm controlledCourt={controlledCourt}/>
      </BaseLayout>
    </Main>
  )
}

class MyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null
    }
  }

  onICTokenChange() {
    const ict = document.getElementById('intercourtToken').value
    const valid = /^[0-9]+$/.test(ict)
    console.log("this.state.controlledCourt=", this.state.controlledCourt, ', ict=', ict)
    this.setState({token: calculateTokenId(this.state.controlledCourt, ict), intercourtTokenValid: valid})
  }

  onRecepientTokenChange() {
    try {
      const address = toChecksumAddress(document.getElementById('recepient').value)
      this.setState({recepientValid: true})
    } catch(e) { 
      console.error('invalid Ethereum address', e.message)
      this.setState({recepientValid: false})
    }
  }

  onAmountChange() {
   this.setState({amountValid: /^[0-9]+$/.test(document.getElementById('amount').value)})
  }

  valid() {
    return this.state.intercourtTokenValid && this.state.recepientValid  && this.state.amountValid
  }
  
  render() {
    const style = {width: '50em'} // prevent the widget to "jump" after the token address is shown
    return (
      <div style={style}>
        <table>
          <tr>
            <TH><label>Intercourt token:</label></TH>
            <td><input id="intercourtToken"
                       type="number"
                       onChange={this.onICTokenChange.bind(this)}
                       class={this.state.intercourtTokenValid ? "" : "error"}/></td>
          </tr>
          <tr><TH>Token:</TH><td>{this.state.token}</td></tr>
          <tr>
            <TH><label>Recepient:</label></TH>
            <td><input id="recepient" size="42" maxlength="42"
                       onChange={this.onRecepientTokenChange.bind(this)}
                       class={this.state.recepientValid ? "" : "error"}/></td>
          </tr>
          <tr>
            <TH><label>Amount:</label></TH>
            <td><input id="amount" type="number" class="error"
                       onChange={this.onAmountChange.bind(this)}
                       class={this.state.amountValid ? "" : "error"}/></td>
          </tr>
        </table>
        <button disabled={this.valid() ? "" : "disabled"}>Mint!</button>
      </div>
    )
  }
}

const H1 = styled.div`
  font-size: 200%;
  font-weight: bold;
`

const H2 = styled.div`
  font-size: 144%;
`

const TH = styled.th`
  text-align: right;
`

const BaseLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
`

const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

function calculateTokenId(court, intercourtToken) {
  return soliditySha3(court, intercourtToken)
}

export default App