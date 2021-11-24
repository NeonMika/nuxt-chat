export const state = () => ({
    session: {}
})

export const mutations = {
    setSession(state, session) {
        state.session = session;
    }
}

export const actions = {
    async nuxtServerInit({dispatch, commit}, {req}) {
        console.log(`store session: ${JSON.stringify(req.session.id)}`)
        if (req.session) {
            commit('setSession', req.session);
        }
    }
}

