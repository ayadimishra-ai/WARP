This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

##
# Steps to add new sub menu on IQ(SPA) By Pradip Vadher on 31/10/2025
##
# Step 1
=> Open Hasura & Enter "Admin Secret" to Log in, If already logged with Hasura skip this step
# Step 2
=> Click on "Data" menu in the status bar, Go to "Data Manager", Under the "Databases" search the table name "Tbl_Pages"
# Step 3
=> Find the parent menu name like "Measure" if you want to add sub menu under the "Measure" menu, Copy the "PageGuid"
# Step 4
=> Click on "Insert Row" & fill the required details below and click on save button
   1. PageGuid must be default
   2. PageKey is name of sub menu like "Goal Settings"
   3. IsActive must be true
   4. URL should be like "goal-settings" [Path must be same as app.js for goal settings route from IQ/SPA] 
   5. PlatformType must be "OPs", "Pro" [Based on Project use]
   6. ParentPageGuid must be copied "PageGuid" from step 3
# Step 5
=> Go to "Browse Rows" & Add new Filters by click on "Add" button, Paste the copied "PageGuid", Verify that all the data are inserted properly, Edit in case of any mistakes
# Step 6 
=> Copy the "PageGuid" of newly added sub menu
# Step 7
=> Open new table "Tbl_Permissions" and Go to "Insert Row", Fill the required details below and click on save button
    1. PermissionGuid must be default
    2. PageGuid must be the copied "PageGuid" from step 6
    3. RoleGuid must be "RoleGuid" from the "Tbl_Roles" [Copy the "RoleGuid" based on required like "ORGANIZATIONADMIN"] 
    4. IsActive must be true
    5. CreatedBy can be null or id of creator like admin, super admin
    6. CreatedDate can default or null or todays date with db format
    7. ModifiedBy can null or any relevant Id
    8. ModifiedDate can null or any relevant date
    9. ResourceKey can name of sub menu [i.e goal-settings] [NoteKeep the ResourceKey Handy or Copied]
    10. MenuType must be "MainMenu", "SideBar", Icon or null, keep "MainMenu" if adding to menu
    11. MenuDisplayOrder must be number from 1 to n, [i.e if there are already two menu added and you want to add 3rd place than add 3]
    12. IconName can be null or any relevant details
    13. activeiconname can be null or any relevant details
    14. iconpath can be null or any relevant details
# Step 8
=> Go to "Browse Rows" & Add new filter by click on "Add" button, Paste the "ResourceKey" from step no. 6, Verify that all the details are properly added, Edit in case of any mistakes
# Step 9 
=> Copy the "PermissionGuid" of newly added sub menu
# Step 10
=> Go to "Tbl_UserPermissions" table & Click on "Insert Row", Fill the required details below and click on save button
    1. UserPermissionGuid must be default
    2. UserGuid must be userId of user [Note. Login to snowkap site and find the userId of that specific user, This UserGuid is NOT from "Tbl_Users" table]
    3. PermissionGuid must be the copied id from step 9
    4. Rights can be "W", "R" or based on usage
    5. CreatedDate can be default
# Step 11
=> Ensure that step 10 details are added properly, Edit the details in case of any mistakes
# Step 12
=> Go to "Tbl_LanguageResources" and click on "Insert Row", Fill the required details below and click on save button
    1. LanguageResourceGuid must be default or any uuid/guid
    2. PageKey must be "Menu" [Note. only while adding menu]
    3. ResourceKey must be same as "Tbl_Pages"'s url or PageKey
    4. ResourceValue must be same "Tbl_Pages"'s url or PageKey
    5. LanguageGuid must be same with "Tbl_LanguageResources" of other data
    6. IsActive must be active
    7. CreatedDate must be default
    8. CreatedBy can be null or any relevant user id
    9. ModifiedDate can null
    10. ModifiedBy can be null or any relevant user id
# Step 13
=> Ensure that step 12 details are added properly, Edit the details in case of any mistakes
# Step 14 
=> Verify on Snowkap that menu added or not
