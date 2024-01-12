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
  const [assigned, setAssigned] = useState(false)
  const [mutateFunction, {data, loading, error}] = useMutation(CREATE_TEAM)

  const newTeams = teamAssigner()

  const assignTeams = () => {
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
    console.log(newTeams)
    setAssigned(true)
  }


return (
  <div>
    <div>
      Rumble {rumbleId}
      {
      !assigned &&
      <button onClick={() => assignTeams()}>Assign Teams</button>
      }
    </div>
    <div>
    <div>
      <div>Team 1</div>
      {assigned && Object.entries(newTeams[1]).map(([key, value]) => {
        return <div>{key}</div>
      })}
    </div>
    <div>
      <div>Team 2</div>
      {assigned && Object.entries(newTeams[2]).map(([key, value]) => {
        return <div>{key}</div>
      })}
    </div>
    <div>
      <div>Team 3</div>
      {assigned && Object.entries(newTeams[3]).map(([key, value]) => {
        return <div>{key}</div>
      })}
    </div>
    </div>
  </div>
  )
}
