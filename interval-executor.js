
Execute = async function(interval, proc)
{
    proc();
    setInterval(proc, interval);
}

module.exports = {
    Execute
}