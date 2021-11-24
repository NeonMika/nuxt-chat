export default function ({ store, redirect }) {
    // If the user is not authenticated
    if (false) { // deactivated
        if (!store.state.username) {
            console.log("not authenticated, redirect to login page")
            return redirect('/login')
        }
    }
}