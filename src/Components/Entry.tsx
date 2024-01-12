import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom'
import { codeGenerator } from '../Utils';
import { useQuery, gql, useMutation } from '@apollo/client';
import { graphql } from 'graphql';
const RUMBLE_QUERY = gql`
     query {
        rumbles {
            id
        }
     }
`

const CREATE_RUMBLE = gql`
    mutation rumble($id: Int!) {
        rumble(id: $id) {
            id
        }
    }
`


export const Entry = () => {
    const navigate = useNavigate()

    const [mutateFunction, {data, loading, error}] = useMutation(CREATE_RUMBLE)

    const newRumble = () => {
        const rumbleId = codeGenerator()
        mutateFunction({variables: {id: rumbleId}})
        navigate(`/rumble/${rumbleId}`, {state: {id: rumbleId}})
    }

return (
    <div>
        <div>Let's Get Ready to Rumble</div>
        <div>
            <div>Join Rumble</div>
            <input placeholder='Enter code'/>
            <button>Go
            </button>
        </div>
        <div>
            <div>New Rumble</div>
            <button onClick={()=>newRumble()}>Go
            </button>
        </div>
    </div>
    )
}
