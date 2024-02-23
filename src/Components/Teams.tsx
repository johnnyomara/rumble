import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { codeGenerator, teamAssigner } from '../Utils';
import { useQuery, gql, useMutation, InMemoryCache, ApolloClient, useSubscription } from '@apollo/client';
import { graphql } from 'graphql';
import {useLocation} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

const TEAM_QUERY = gql`
     query team ($id: Int!) {
        team (id:$id) {
            teamid
            number
            wrestlerid
            name
            eliminated
        }
     }
`

// export const Wrestlers = (teamObj: any) => {
//   console.log(teamObj)
//   return(
//   <div>
//    {Object.keys(teamObj).map((key) => {
//     return (
//       <div>{[key]}</div>
//     )
//    })}
//   </div>
//   )
// }

export const Teams = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const teamId = location.state.teamId
  const teamNumber = location.state.teamNumber
  const rumbleId = location.state.id
  const [team, setTeam] = useState([])
  const { subscribeToMore, data, loading, error } = useQuery(TEAM_QUERY, {variables: {id: Number(teamId)}})

if (!loading && Object.keys(team).length === 0) {
  setTeam(data.team)
}
const viewWrestler = (wrestlerId: Number) => {
  navigate(`/rumble/${rumbleId}/${teamNumber}/${wrestlerId}`, {state: {id: Number(rumbleId), wrestlerId}})


}

  return(
  <div>
    <div>Team {teamNumber}</div>
    <div>
      {!loading &&
      team.map((wrestler: any) => {
        return (
          <div>
            <div>{wrestler.number}</div>
            <div>{wrestler.name}</div>
            <button onClick={() => viewWrestler(wrestler.wrestlerid) }>Edit</button>
          </div>
        )
      })}
    </div>
  </div>)
}
