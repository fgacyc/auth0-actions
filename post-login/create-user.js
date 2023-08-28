const event = `post-login`;
const action = `Create user`;
const logInfo = (...args) => console.log(`${event}(${action}): `, ...args);
const logError = (...args) => console.error(`${event}(${action}): `, ...args);

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  logInfo(
    `${event.user.user_id} (${event.user.email}) from ${event.client.name}(${event.client.client_id})`,
  );
  // Only execute this action for first time users
  if (event.stats.logins_count > 1) {
    logInfo(
      `skipping action because ${event.user.user_id} has ${event.stats.logins_count} logins count`,
    );
    return;
  }

  // const ManagementClient = require('auth0').ManagementClient;
  // const management = new ManagementClient({
  //   domain: event.secrets.DOMAIN,
  //   clientId: event.secrets.CLIENT_ID,
  //   clientSecret: event.secrets.CLIENT_SECRET,
  // });

  const postgres = require('postgres');
  const sql = postgres(event.secrets.DATABASE_URL, { transform: { undefined: null } });

  try {
    await sql`
      INSERT INTO "user" (
        id, 
        name, 
        email, 
        email_verified, 
        username, 
        given_name, 
        family_name, 
        phone_number, 
        phone_number_verified, 
        nickname, 
        avatar_url
      ) VALUES (
        ${event.user.user_id}, 
        ${event.user.name}, 
        ${event.user.email}, 
        ${event.user.email_verified}, 
        ${event.user.username}, 
        ${event.user.given_name}, 
        ${event.user.family_name}, 
        ${event.user.phone_number}, 
        ${event.user.phone_verified}, 
        ${event.user.nickname}, 
        ${event.user.picture}
      ) 
    `;
  } catch (e) {
    logError(`Failed to insert new user ${event.user.user_id} (${event.user.email}): ${e.message}`);
  }

  // const DEFAULT_ROLES = event.secrets.DEFAULT_ROLES.split(',').map((role) => role.trim());
  // logInfo('DEFAULT_ROLES: ', DEFAULT_ROLES);
  //
  // try {
  //   const roles = (await management.getRoles())
  //     .filter((role) => DEFAULT_ROLES.includes(role.name) && role.id)
  //     .map((role) => role.id);
  //   if (!roles.length) {
  //     logError(`Failed to find default role of ${event.secrets.DEFAULT_ROLES}`);
  //     return;
  //   }
  //
  //   await management.assignRolestoUser({ id: event.user.user_id }, { roles });
  //   logInfo(`Assigned default roles ${roles} to user ${event.user.user_id} (${event.user.email})`);
  // } catch (e) {
  //   logError(
  //     `Failed to assign default roles to user ${event.user.user_id} (${event.user.email}): ${e.message}`,
  //   );
  //   return;
  // }

  // const quotas = event.secrets.DEFAULT_QUOTAS
  //   .split(',')
  //   .map((role) => role.trim())
  //   .map((role) => role.split(':'))
  //   .map(([name, value]) => ({ name, value: Number(value) }))
  // logInfo('DEFAULT_QUOTAS: ', quotas);

  // // Insert default quotas into database for user.
  // try {
  //   for (const { name, value } of quotas)
  //     await sql`insert into cybotrade.quota (user_id, name, value) values (${event.user.user_id}, ${name}, ${value})`;
  // } catch (e) {
  //   logError(
  //     `Failed to add default quotas to user ${event.user.user_id} (${event.user.email}): ${e.message}`,
  //   );
  //   return;
  // }
};

/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
// exports.onContinuePostLogin = async (event, api) => {
// };

