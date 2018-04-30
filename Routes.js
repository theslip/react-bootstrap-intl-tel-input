import React, { Component } from 'react'
import { Route, Switch } from 'react-router'
import IntlTelInput from './src'

export class Routes extends Component {
  render () {
    return (
      <div className='col-md-4 offset-md-4' style={{marginTop: 200}}>
        <Switch>
          <Route exact path='/' render={() => {
            return (
              <IntlTelInput
                preferredCountries={['US', 'GB']}
                defaultCountry={'US'}
                defaultValue={'+1 555-555-5555'}
              />
            )
          }} />
        </Switch>
      </div>
    )
  }
}
