export function UIActionNotifier({game, label, data = {}, disabled = false, children}) {
    if (disabled) {
        return children;
    }

    const notifyUIAction = () => {
        game.notifyUIAction(label, data);
    }

    return (
        <div onClick={notifyUIAction}>
            {children}
        </div>
    )
}