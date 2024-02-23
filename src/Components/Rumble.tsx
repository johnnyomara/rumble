import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { codeGenerator, teamAssigner } from '../Utils';
import { useQuery, gql, useMutation, InMemoryCache, ApolloClient, useSubscription } from '@apollo/client';
import { graphql } from 'graphql';
import {useLocation} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'


// const client = new ApolloClient({
//   // ...other arguments...
//   cache: new InMemoryCache(options)
// });

const WRESTLER_QUERY = gql`
     query wrestlers ($id: Int!) {
        wrestlers (id:$id) {
            teamid
            number
            wrestlerid
        }
     }
`

const WRESTLER_SUBSCRIPTION = gql`
subscription wrestlers ($id: Int!) {
   wrestlers (id:$id) {
       teamid
       number
       wrestlerid
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
mutation wrestlers($wrestlerid: Int!, $number: Int!, $teamid: Int!, $id: Int!, $eliminated: Boolean!) {
  wrestlers(wrestlerid: $wrestlerid, number: $number, teamid: $teamid, id: $id, eliminated: $eliminated) {
  wrestlerid, number, teamid, id, eliminated
  }
}
`
export interface TeamObject {
  [index: number]: any
}

export const teamLineup = (teamNum: Number, rumble: any) => {
  const team = String(teamNum)
  return(
  <div>
   {Object.keys(rumble[team]).map((key) => {
    return (
      <div>{rumble[team][key]?.number}</div>
    )
   })}
  </div>
  )
}
//HANDLE NAVIGATING FROM JOIN

export const Rumble = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const rumbleId = location.state.id
  const [allWrestlers, setAllWrestlers] = useState<TeamObject[]>([])
  const [assigned, setAssigned] = useState(false)
  const [teamObject, setTeamObject] = useState({})
  const [createTeams] = useMutation(CREATE_TEAM)
  const [createWrestlers] = useMutation(CREATE_WRESTLER)
  const { subscribeToMore, data, loading, error } = useQuery(WRESTLER_QUERY, {variables: {id: Number(rumbleId)}})

useEffect(() => {
  // console.log("HERE IS THE ID", rumbleId)
  // rumbleSubscription()
  if (data?.wrestlers?.length === 30){
    setAllWrestlers(data.wrestlers)
    setAssigned(true)
    teamObjGenerator(data.wrestlers)
    // console.log("THIS IS THE IF",data)
  } else {
    // console.log("THIS IS THE ELSE",data)

  }
}, [allWrestlers, data])

// useEffect(() => rumbleSubscription(), [])

  const newTeams = teamAssigner()

  const assignWrestlers = async (teams: any) => {
    const wrestlerArray: TeamObject[] = []
    for (const [team, value] of Object.entries(teams)) {
      for(const [wrestler, stats] of Object.entries(teams[team])) {
        const teamNum = Number(team)
        const created = await createWrestlers({
          variables: {
            teamid: Number(`${rumbleId}${teamNum}`),
            number: Number(wrestler),
            wrestlerid: Number(`${rumbleId}${wrestler}`),
            id: Number(rumbleId),
            eliminated: false
          }
        })
        wrestlerArray.push(created.data.wrestlers)
      }
    }
    setAllWrestlers(wrestlerArray)
    setAssigned(true)
    teamObjGenerator(wrestlerArray)
  }

  const assignTeams = () => {
    createTeams({variables: {
      id: rumbleId, number: 1, teamid: Number(`${rumbleId}1`)
    }})
    createTeams({variables: {
      id: rumbleId, number: 2, teamid:  Number(`${rumbleId}2`)
    }})
    createTeams({variables: {
      id: rumbleId, number: 3, teamid:  Number(`${rumbleId}3`)
    }})
    assignWrestlers(newTeams)
  }

  const teamObjGenerator = (teamArray: any) => {
    if (teamArray) {
      const teamObj: TeamObject = {1: {}, 2: {}, 3: {}}
    teamArray.map((wrestler: any): any => {
      const currentTeam = Number(String(wrestler.teamid).slice(-1))
      const currentWrestlerNumber = wrestler.number
      teamObj[currentTeam][currentWrestlerNumber] = wrestler
      return teamObj
    })
    // console.log("TEAMOBJ", teamObj)
    setTeamObject(teamObj)
    }
  }

  const rumbleSubscription = () => {
    subscribeToMore({
      document: WRESTLER_SUBSCRIPTION,
      variables: {id: Number(rumbleId)},
      updateQuery: (prev, {subscriptionData}) => {

        if (!subscriptionData.data) return prev;
        const newRumbleItem = subscriptionData.data.wrestlers;
        return Object.assign({}, prev, {
         newRumbleItem
        })

      //  console.log("THIS IS SUB", newRumbleItem)
      //  setAllWrestlers(newRumbleItem)
      //  console.log("CHECK THIS", allWrestlers)
      //  return newRumbleItem
      }
    })
  }

  const viewTeam = (teamNumber: number) => {
    const teamId = Number(String(rumbleId) + String(teamNumber))
    navigate(`/rumble/${rumbleId}/${teamNumber}`, {state: {id: Number(rumbleId), teamId, teamNumber}})
}


return (
  <div>
      <div>Rumble {rumbleId}</div>
      {!assigned ?
      <div>
        <button onClick={() => assignTeams()}>Assign Teams</button>
      </div> :
     <div>
      <div>
        <div>Team 1</div>
        <button onClick={() => viewTeam(1)}>View Team</button>
        <div>
          {teamLineup(1, teamObject)}
        </div>
      </div>
      <div>
        <div>Team 2</div>
        <div>
          {teamLineup(2, teamObject)}
        </div>
      </div>
      <div>
        <div>Team 3</div>
        <div>
          {teamLineup(3, teamObject)}
        </div>
      </div>
     </div>
    }
  </div>
  )
}
