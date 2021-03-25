
import './App.css';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';   

var transfer_function = function() {
  
  //These are test keys .. yes I know they're in GitHub
  const privateKeys = ['5KbcD6bjqhFmsrEe3HZvb9qnTijWSsVCNFohsAcpQGjExUbAKot','5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'];

  const signatureProvider = new JsSignatureProvider(privateKeys);
  const rpc = new JsonRpc('https://jungle3.cryptolions.io:443', { fetch });
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

  const account_paying_for_resources_name = 'efnpnjedipp3';
  const account_paying_for_resources_permission = 'active';

  var actions = [
    {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: 'wozzawozzaz1',
        permission: 'active',
      }],
      data: {
        from: 'wozzawozzaz1',
        to: 'wozzawozzaz2',
        quantity: '1.0000 EOS',
        memo: 'some memo'
      }
    }        
  ];


  // Get the the abi for the 1st action in the array
  api.abiProvider.getRawAbi(actions[0].account).then((getRawAbi_result) => {

    var rawAbi =  getRawAbi_result.abi;
    var abi = api.rawAbiToJson(rawAbi);
    var cachedAbi = { rawAbi, abi };

    // Add this Abi to the cache
    api.cachedAbis.set(actions[0].account, cachedAbi);
    // Add it again, but this time associate it with the account name 'eosio.null'
    api.cachedAbis.set('eosio.null', cachedAbi);

    // Copy the 1st transaction in the array and modify the account to be eosio.null + change the actor and permission to the account paying for resources. 
    var eosio_null_action = JSON.parse(JSON.stringify(actions[0]));
    eosio_null_action.account = 'eosio.null';
    eosio_null_action.authorization[0].actor = account_paying_for_resources_name;
    eosio_null_action.authorization[0].permission = account_paying_for_resources_permission;

    // Prepend the 'eosio.null' version of this action to the front of the actions array
    actions.unshift(
      eosio_null_action
    );

    console.log(actions);

    (async () => {
      await api.transact({
        actions: actions
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then((txn_result) => {
        console.log(txn_result);
      });
    })();

  });

}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={transfer_function}>Run Transaction</button>
      </header>
    </div>
  );
}

export default App;
