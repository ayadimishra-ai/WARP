        import jwt from 'jsonwebtoken'; // Ensure you're importing the correct library
        import * as RoleCodes from './rolecodes'; // Import RoleCodes if it's in another file
        
        export const userRoles = () => {
         
          const userType = JSON.parse(localStorage.getItem('userType'));
          let UserRole="";
          const warpToken = jwt.decode(localStorage.getItem('warpToken'));
          if (warpToken !== null) {
            UserRole = warpToken["https://hasura.io/jwt/claims"]["x-hasura-role"];
          }
          return {
            isLocationExecutive: () => userType === RoleCodes.LOCATIONEXECUTIVE,
            isOrganizationAdmin: () => userType === RoleCodes.ORGANIZATIONADMIN,
            isVentureCapitaList: () => userType === RoleCodes.VENTURECAPITALIST,
            isKhaitanInvitee: () => (UserRole === "Invitee" || UserRole === "Responder"),
          };
        };