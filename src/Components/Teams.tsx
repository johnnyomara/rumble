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

export const Teams = () => {
  const location = useLocation()
  const teamId = location.state.teamId
  const { subscribeToMore, data, loading, error } = useQuery(TEAM_QUERY, {variables: {id: Number(teamId)}})
console.log(data)



  return(<div>TEST</div>)
}
