import React from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { Button } from '../Buttons/Button'

const TableData = ({
  Heading,
  SubHeading,
  tableHeadings = [],
  showSearch = true,
  data,
  searchTerm,
  setSearchTerm,
  fromDate,
  setFromDate,
  setToDate,
  toDate,
  onAdd,
  showExtraAdd = true,
  showDateFilter = true,
  actionAdd,
  placeholder = 'Search Here...',
  categories = [],
  selectedCategory,
  setSelectedCategory,
  showDropdownFilter = false,
  selectDropDownName,
  selectDropDownLabel,
}) => {
  const today = new Date().toISOString().split('T')[0]

  return (
    <section className="w-full text-default-text">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-xl lg:text-2xl font-semibold">
            {Heading}
          </h1>
          <p className="text-sm text-light-text">
            {SubHeading}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="lg:flex items-end justify-between gap-6 space-y-4 lg:space-y-0">
        {/* Search */}
        {showSearch && (
          <div className="space-y-2 lg:w-80 w-full">
            <label className="text-xs text-light-text">Search</label>
            <div className="relative">
              <IoSearchOutline
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text"
              />
              <input
                className="w-full pl-10 px-4 py-2 rounded-lg bg-glass-bg
                           border border-glass-border
                           placeholder:text-light-text
                           focus:outline-none"
                placeholder={placeholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Dropdown */}
        {showDropdownFilter && (
          <div className="space-y-2 lg:w-96 w-full">
            <label className="text-xs text-light-text">
              {selectDropDownLabel}
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg bg-card-bg
                         border border-borderColor
                         focus:outline-none capitalize"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">{selectDropDownName}</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.roleName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Add Button */}
        {showExtraAdd && (
          <div className="lg:w-40 w-full ml-auto">
            <Button onClick={onAdd} className="btn-primary w-full">
              {actionAdd || 'Add'}
            </Button>
          </div>
        )}

        {/* Date Filters */}
        {showDateFilter && (
          <div className="flex gap-4 lg:w-1/2">
            {[
              { label: 'From Date', value: fromDate, set: setFromDate },
              { label: 'To Date', value: toDate, set: setToDate },
            ].map(({ label, value, set }, i) => (
              <div key={i} className="w-full space-y-2">
                <label className="text-xs text-light-text">{label}</label>
                <input
                  type="date"
                  value={value}
                  max={today}
                  onChange={e => set(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-card-bg
                             border border-borderColor
                             focus:outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-6 card overflow-x-auto hidden xl:block">
        <table className="w-full">
          <thead className="border-b border-borderColor">
            <tr>
              {tableHeadings.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-3 text-left text-sm font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data?.length ? (
              data.map((row, i) => (
                <tr key={i} className="border-b border-borderColor">
                  {row.map((cell, j) => (
                    <td key={j} className="px-5 py-3 text-sm">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeadings.length} className="py-10 text-center">
                  <p className="text-light-text">No data found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="xl:hidden mt-6 space-y-4">
        {data?.length ? (
          data.map((row, i) => (
            <div key={i} className="card">
              {row.map((cell, j) => (
                <div
                  key={j}
                  className="flex justify-between py-2 border-b border-borderColor last:border-0"
                >
                  <span className="text-xs text-light-text">
                    {tableHeadings[j]}
                  </span>
                  <span className="text-sm">{cell}</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="card text-center">
            <p className="text-light-text">No data found</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default TableData
