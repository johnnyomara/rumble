export const codeGenerator = () => {
  const code = Math.floor(Math.random() * 9000 + 1000);
  return code
}

export interface Teams {
  [key: number]: Team;
}

export interface Team {
  [key: number]: Object;
}

export const teamAssigner = () => {

  const teams: Teams = {
    1: {},
    2: {},
    3: {}
  }

  for (let i = 1; i <= 30; i++) {
    let randomTeam = Math.floor(Math.random() * 3) + 1
    if (Object.keys(teams[randomTeam]).length < 10) {
      teams[randomTeam][i] = {}
    } else i--
  }
  return teams
}


