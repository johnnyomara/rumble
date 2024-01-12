import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { codeGenerator, teamAssigner } from '../Utils';
import { useQuery, gql, useMutation } from '@apollo/client';
import { graphql } from 'graphql';
import {useLocation} from 'react-router-dom';
import { useState } from 'react';

const RUMBLE_QUERY = gql`
     query {
        rumbles {
            id
        }
     }
`

const CREATE_TEAM = gql`
mutation teams($id: Int!, $number: Int!, $teamid: Int!) {
  teams(id: $id, number: $number, teamid: $teamid) {
  id, number, teamid
  }
}
`

export const Rumble = () => {
  const location = useLocation()
  const rumbleId = location.state.id
  const [teams, setTeams] = useState({})
  const [mutateFunction, {data, loading, error}] = useMutation(CREATE_TEAM)




  const assignTeams = () => {
    const newTeams = teamAssigner()
    setTeams(newTeams)
    mutateFunction({variables: {
      id: rumbleId, number: 1, teamid: Number(`${rumbleId}1`)
    }})
    mutateFunction({variables: {
      id: rumbleId, number: 1, teamid:  Number(`${rumbleId}2`)
    }})
    mutateFunction({variables: {
      id: rumbleId, number: 1, teamid:  Number(`${rumbleId}3`)
    }})
  }


return (
  <div>
    <div>
      Rumble {rumbleId}
      {
      // Object.keys(teams).length === 0 &&
      <button onClick={() => assignTeams()}>Assign Teams</button>
      }
    </div>
    <div>
    <div>
      <div>Team 1</div>
    </div>
    <div>
      <div>Team 2</div>
    </div>
    <div>
      <div>Team 3</div>
    </div>
    </div>
  </div>
  )
}
