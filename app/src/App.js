import { zip } from 'rxjs';
import React from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Button, Tabs } from '@aragon/ui'
import styled from 'styled-components'
import Parser from 'html-react-parser';
const { soliditySha3, toChecksumAddress } = require("web3-utils")

function App() {
  const { api, appState, setAppState, path, requestPath } = useAragonApi()
  const { isSyncing } = appState
  const pathParts = path.match(/^\/tab\/([0-9]+)/)
  const pageIndex = Array.isArray(pathParts)
    ? parseInt(pathParts[1], 10) - 1
    : 0

  return (
    <Main>
      {isSyncing && <Syncing />}
      <H1>Judge Whom to Give Rewards</H1>
      <Tabs items={['Info', 'Manage', 'Create token', 'Mint']} selected={pageIndex} onChange={index => requestPath(`/tab/${index + 1}`)}/>
      <div style={{display: pageIndex == 0 ? 'block' : 'none'}}>
        <p>Owned contract: {appState.ownedContract}</p>
      </div>
      <div style={{display: pageIndex == 1 ? 'block' : 'none'}}>
        <H2>Manage</H2>
        <ManageForm ownedContract={appState.ownedContract} api={api}/>
      </div>
      <div style={{display: pageIndex == 2 ? 'block' : 'none'}}>
        <H2>Create token</H2>
        <CreateTokenForm ownedContract={appState.ownedContract} api={api}/>
      </div>
      <div style={{display: pageIndex == 3 ? 'block' : 'none'}}>
        <H2>Send any amount of tokens to recipients of your choice.</H2>
        <MintForm ownedContract={appState.ownedContract} api={api}/>
      </div>
    </Main>
  )
}

class ManageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ownedValid: false, ownerValid: false
    }
    this.ownedInput = React.createRef()
    this.ownerInput = React.createRef()
  }

  onOwnedChange() {
    try {
      const address = toChecksumAddress(this.ownedInput.current.value)
      this.setState({ownedValid: true})
    } catch(e) { 
      console.error('invalid Ethereum address', e.message)
      this.setState({ownedValid: false})
    }
  }

  onOwnerChange() {
    try {
      const address = toChecksumAddress(this.ownerInput.current.value)
      this.setState({ownerValid: true})
    } catch(e) { 
      console.error('invalid Ethereum address', e.message)
      this.setState({ownerValid: false})
    }
  }

  valid() {
    return this.state.ownedValid
  }
  
  changeCourt() {
    console.log(this.ownedInput.current.value)
    return this.props.api.setCourt(this.ownedInput.current.value).toPromise()
  }
    
  changeOwner() {
    return this.props.api.setContractOwner(this.ownerInput.current.value).toPromise()
  }
  
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <TH>Owned contract:</TH>
              <td><input size="42" maxLength="42" ref={this.ownedInput} onChange={this.onOwnedChange.bind(this)}
                        className={this.state.ownedValid ? "" : "error"}/></td>
            </tr>
          </tbody>
        </table>
        <button disabled={this.valid() ? "" : "disabled"}
                onClick={this.changeCourt.bind(this)}>Change</button>
        <div style={{background: 'red', padding: '3px', marginTop: '0.5ex'}}>
          <H2>Danger zone:</H2>
          Core contract owner:
          <input ref={this.ownerInput} onChange={this.onOwnerChange.bind(this)}
                className={this.state.ownerValid ? "" : "error"}/>
          <button disabled={this.state.ownerValid ? "" : "disabled"}
                  onClick={this.changeOwner.bind(this)}>Change</button>
        </div>
      </div>
    )
  }
}

class CreateTokenForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
    this.parentInput = React.createRef()
    this.nameInput = React.createRef()
    this.symbolInput = React.createRef()
    this.uriInput = React.createRef()
  }
  
  createToken() {
    return this.props.api.newToken(
      this.parentInput.current.value || '0',
      this.nameInput.current.value,
      this.symbolInput.current.value,
      this.uriInput.current.value).toPromise()
  }
  
  render() {
    return (
      <div>
        <table>
          <tbody>
          <tr>
              <TH>Parent token ID:</TH>
              <td><input type="number" ref={this.parentInput} /></td>
            </tr>
            <tr>
              <TH>Token name:</TH>
              <td><input ref={this.nameInput} /></td>
            </tr>
            <tr>
              <TH>Symbol name:</TH>
              <td><input ref={this.symbolInput} /></td>
            </tr>
            <tr>
              <TH>Token URI:</TH>
              <td><input type="url" ref={this.uriInput} /></td>
            </tr>
          </tbody>
        </table>
        <button onClick={this.createToken.bind(this)}>Create</button>
      </div>
    )
  }
}

let rewardCourtsJSON = null;

function fetchRewardCourtsJSON() {
  if(rewardCourtsJSON !== null)
    return rewardCourtsJSON;
  let f = fetch("public/RewardCourts.json")
  rewardCourtsJSON = f.then((response) => {
    return response.json()
  })
  return rewardCourtsJSON
}

class MintForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      recepientValid: false, amountValid: false
    }
    this.ICTokenInput = React.createRef()
    this.recepientInput = React.createRef()
    this.amountInput = React.createRef()
  }

  onAmountChange() {
    this.setState({amountValid: /^[0-9]+(\.[0-9]+)?$/.test(this.amountInput.current.value)})
  }

  valid() {
    return this.state.amountValid
  }
  
  mint() {
    // TODO
  }
  
  render() {
    const style = {width: '50em'} // prevent the widget to "jump" after the token address is shown
    return (
      <div style={style}>
        <table>
          <tbody>
            <tr>
              <TH><label>Token:</label></TH>
              <td><input ref={this.ICTokenInput}
                        type="number"
                        onChange={this.onICTokenChange.bind(this)}
                        className={this.state.intercourtTokenValid ? "" : "error"}/></td>
            </tr>
            <tr><TH>Token:</TH><td>{this.state.token}</td></tr>
            <tr>
              <TH><label>Recepient:</label></TH>
              <td><input ref={this.recepientInput}
                        size="42" maxLength="42"
                        onChange={this.onRecepientTokenChange.bind(this)}
                        className={this.state.recepientValid ? "" : "error"}/></td>
            </tr>
            <tr>
              <TH><label>Amount:</label></TH>
              <td><input ref={this.amountInput}
                        id="amount" type="text"
                        onChange={this.onAmountChange.bind(this)}
                        className={this.state.amountValid ? "" : "error"}/></td>
            </tr>
          </tbody>
        </table>
        <button disabled={this.valid() ? "" : "disabled"}
                onClick={this.mint.bind(this)}>Mint!</button>
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

const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

export default App
