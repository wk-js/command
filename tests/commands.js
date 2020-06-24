const { register, inherit, variable } = require('../js')

variable("target", "experience")
variable("xt_dir", "--source-dir build/${target}")
variable("build_env", "development")

register({
  start: "wk xrun",
  pwd: `pwd
    && cd tests
    && pwd`,
  echo: "echo",
  config: "npx tsc -p config/tsconfig.json",
  webext: "npx web-ext",
  task: "node tmp/tasks.js",
  bump: "wk task bump",
  bump_patch: "wk bump patch",
  build: `wk config && npx webpack
    --config tmp/build.js
    --env.target=\${target}
    --env.environment=\${build_env}`,
  build_zip: `rm -rf build/\${target} && wk build --env.zip & wk build --env.nope`,
  xlint: "wk webext lint ${xt_dir}",
  xsign: `wk webext sign \${xt_dir}
    --api-key=$WEB_EXT_API_KEY
    --api-secret=$WEB_EXT_API_SECRET
    --id=$WEB_EXT_ID
    --channel=$WEB_EXT_CHANNEL`,
  xrun: {
    command: `wk webext run \${xt_dir}
      -t \${target}
      --start-url http://localhost:3000
      --browser-console`,
    options() {
      const { args } = inherit()
      return {
        variables: {
          target: args[0] === "firefox" ? "firefox-desktop" : "chromium"
        }
      }
    }
  }
})