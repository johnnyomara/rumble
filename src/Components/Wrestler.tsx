import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { codeGenerator, teamAssigner } from "../Utils";
import {
  useQuery,
  gql,
  useMutation,
  InMemoryCache,
  ApolloClient,
  useSubscription,
} from "@apollo/client";
import { graphql } from "graphql";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
`;

const WRESTLER_SUBSCRIPTION = gql`
  subscription wrestlers($id: Int!) {
    wrestlers(id: $id) {
      teamid
      number
      wrestlerid
      name
    }
  }
`;


const WRESTLER_MUTATION = gql`
mutation wrestler($wrestlerid: Int!, $name: String!) {
  wrestler(wrestlerid: $wrestlerid, name: $name) {
  wrestlerid, name
  }
}
`

export const Wrestler = () => {
  const location = useLocation();
  const wrestlerId = location.state.wrestlerId;
  const rumbleId = location.state.id;
  const [wrestler, setWrestler] = useState<any>(undefined);
  const [allWrestlers, setAllWrestlers] = useState<any>(undefined);
  const [editName, setEditName] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>("")
  const [updateWrestler] = useMutation(WRESTLER_MUTATION)
  const { subscribeToMore, data, loading, error } = useQuery(WRESTLER_QUERY, {
    variables: { id: wrestlerId },
  });
  const allWrestlerQueryResults = useSubscription(WRESTLER_SUBSCRIPTION, {
    variables: { id: rumbleId },
  });

  if (!loading && wrestler === undefined && data.wrestlers) {
    setWrestler(data.wrestlers[0]);
  }

  if (!allWrestlerQueryResults.loading && allWrestlers === undefined) {
    setAllWrestlers(allWrestlerQueryResults.data.wrestlers);
  }

  const NameEditor = () => {
    return (
      <div>
        <div>
          Enter Name:
          <input type="text" defaultValue={"Wrestler Name"} value={formName} onChange={handleNameChange}/>
        </div>
        <button onClick={() => handleEditClose()}>OK</button>
      </div>
    );
  };

  const handleEditOpen = () => {
    setEditName(true);
  };

  const handleNameChange = (event: any) => {
    setFormName(event?.target.value)
  }

  const handleEditClose = async() => {
    const created = await updateWrestler({
      variables: {
        wrestlerid: Number(wrestler.wrestlerid),
        name: formName
      }
    })
    console.log(created)
    setEditName(false)
    setFormName("")

  }
console.log(wrestler)
  return (
    <>
      {wrestler !== undefined && (
        <div>
          <div>Number: {wrestler.number}</div>
          <div>
            <div>Name: {wrestler.name}</div>
            <div onClick={() => handleEditOpen()}>✏️</div>
            {editName && NameEditor()}
          </div>
          <div>
            Eliminated? {wrestler.eliminated === true ? "Yes" : "Not yet"}
          </div>
          {wrestler.eliminated && (
            <div>Eliminated by: {wrestler.eliminatedby}</div>
          )}
          <div>Who have they eliminated?</div>
          <div>
            {allWrestlers &&
              allWrestlers.map((eliminatedWrestler: any) => {
                if (eliminatedWrestler.name !== null) {
                  return (
                    <div>
                      <div>{eliminatedWrestler.number}.</div>
                      <div>{eliminatedWrestler.name}</div>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
          </div>
          <div></div>
        </div>
      )}
    </>
  );
};
