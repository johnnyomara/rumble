import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { codeGenerator, teamAssigner } from '../Utils';
import { useQuery, gql, useMutation, InMemoryCache, ApolloClient, useSubscription } from '@apollo/client';
import { graphql } from 'graphql';
import {useLocation} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

const WRESTLER_QUERY = gql`
query wrestlers($id: Int!) {
  wrestlers(id: $id) {
    wrestlerid
    number
    teamid
    name
    eliminated
    eliminates
    eliminatedby
    id
     }
}
`

const WRESTLER_SUBSCRIPTION = gql`
subscription wrestlers ($id: Int!) {
   wrestlers (id:$id) {
       teamid
       number
       wrestlerid
       name
   }
}
`


export const Wrestler = () => {
  const location = useLocation()
  const wrestlerId = location.state.wrestlerId
  const rumbleId = location.state.id
  const [wrestler, setWrestler] = useState<any>(undefined)
  const { subscribeToMore, data, loading, error } = useQuery(WRESTLER_QUERY, {variables: {id: wrestlerId}})
  const allWrestlers = useSubscription(WRESTLER_SUBSCRIPTION, {variables: {id: rumbleId}})
  console.log(allWrestlers.data)

if (!loading && wrestler === undefined) {
  setWrestler(data.wrestlers[0])
}
  return (
    <>
    {wrestler !== undefined && <div>
      <div>Number: {wrestler.number}</div>
      <div>Name: {wrestler.name}</div>
      <div>Eliminated? {wrestler.eliminated === true? "Yes" : "Not yet"}</div>
      {wrestler.eliminated && <div>Eliminated by: {wrestler.eliminatedby}</div>}
      <div>Who have they eliminated?</div>
      <div>

      </div>
      <div></div>
    </div>}
    </>
  )
}
