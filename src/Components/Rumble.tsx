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

const CREATE_WRESTLER = gql`
mutation wrestlers($wrestlerid: Int!, $number: Int!, $teamid: Int!) {
  wrestlers(wrestlerid: $wrestlerid, number: $number, teamid: $teamid) {
  wrestlerid, number, teamid
  }
}
`

export const Rumble = () => {
  const location = useLocation()
  const rumbleId = location.state.id
  const [teams, setTeams] = useState({})
  const [assigned, setAssigned] = useState(false)
  const [createTeams] = useMutation(CREATE_TEAM)
  const [createWrestlers] = useMutation(CREATE_WRESTLER)


  const newTeams = teamAssigner()

  const assignWrestlers = (teams: any) => {

    for (const [team, value] of Object.entries(teams)) {
      for(const [wrestler, stats] of Object.entries(teams[team])) {
        createWrestlers({
          variables: {
            teamid: Number(team),
            number: Number(wrestler),
            wrestlerid: Number(`${rumbleId}${wrestler}`)
          }
        })
      }
    }
  }

  const assignTeams = () => {
    setTeams(newTeams)
    createTeams({variables: {
      id: rumbleId, number: 1, teamid: Number(`${rumbleId}1`)
    }})
    createTeams({variables: {
      id: rumbleId, number: 2, teamid:  Number(`${rumbleId}2`)
    }})
    createTeams({variables: {
      id: rumbleId, number: 3, teamid:  Number(`${rumbleId}3`)
    }})
    setAssigned(true)
    assignWrestlers(newTeams)
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
    {/* <div>
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
    </div> */}
  </div>
  )
}
