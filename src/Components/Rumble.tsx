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

const CREATE_TEAMS = gql`
mutation teams($id: Int!) {
  teams(id: rumbleId) {
      teams
  }
}
`

export const Rumble = () => {
  const location = useLocation()
  const rumbleId = location.state.id
  const [teams, setTeams] = useState({})
  const [mutateFunction, {data, loading, error}] = useMutation(CREATE_TEAMS)




  const assignTeams = () => {
    setTeams(teamAssigner())
    console.log(location.state)
        // mutateFunction({variables: {teams: teams}})
  }


return (
  <div>
    <div>
      Rumble {rumbleId}
      {
      Object.keys(teams).length === 0 &&
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
