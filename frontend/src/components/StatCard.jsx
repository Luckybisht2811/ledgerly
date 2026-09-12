function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-white mt-2">
            {value}
          </h3>

          <p className="text-xs text-slate-500 mt-2">
            {description}
          </p>
        </div>

        {Icon && (
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Icon size={22} />
          </div>
        )}

      </div>

    </div>
  );
}

export default StatCard;