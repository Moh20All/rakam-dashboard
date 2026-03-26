'use client';

import React, { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Bug, Lightbulb, MessageSquare, Terminal } from 'lucide-react';
import { markCrashResolved } from './actions';

export default function MonitoringClient({ feedback, crashes }) {
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' | 'crashes'

  // Feedback State
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('All');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);

  // Crashes State
  const [showResolvedCrashes, setShowResolvedCrashes] = useState(false);
  const [expandedCrashId, setExpandedCrashId] = useState(null);
  const [isMutatingCrash, setIsMutatingCrash] = useState(null);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Bug': return <Bug className="w-4 h-4 text-orange-500" />;
      case 'Suggestion': return <Lightbulb className="w-4 h-4 text-amber-500" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Bug': return 'bg-orange-100 text-orange-700';
      case 'Suggestion': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  // Filtered Data
  const filteredFeedback = feedback.filter(f => feedbackTypeFilter === 'All' || f.type === feedbackTypeFilter);
  const filteredCrashes = crashes.filter(c => showResolvedCrashes || !c.resolved);

  const handleToggleResolved = async (id, currentStatus) => {
    setIsMutatingCrash(id);
    try {
      await markCrashResolved(id, !currentStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMutatingCrash(null);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 pb-8">
        <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">App Monitoring</h1>
        <p className="text-slate-500 text-lg font-normal">Track user feedback and application crash reports.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-1 text-sm font-semibold transition-colors ${
            activeTab === 'feedback'
              ? 'border-b-2 border-accent text-primary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          User Feedback ({feedback.length})
        </button>
        <button
          onClick={() => setActiveTab('crashes')}
          className={`pb-3 px-1 text-sm font-semibold transition-colors ${
            activeTab === 'crashes'
              ? 'border-b-2 border-accent text-primary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Crash Reports ({crashes.filter(c => !c.resolved).length} Open)
        </button>
      </div>

      {activeTab === 'feedback' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 items-center pb-2">
            <span className="text-sm font-medium text-slate-500">Filter by Type:</span>
            {['All', 'Bug', 'Suggestion', 'Other'].map(type => (
              <button
                key={type}
                onClick={() => setFeedbackTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  feedbackTypeFilter === type
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Feedback Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest w-12"></th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Type</th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest w-full">Message Snippet</th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">App / OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFeedback.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No feedback found.</td>
                    </tr>
                  ) : null}
                  {filteredFeedback.map(item => {
                    const isExpanded = expandedFeedbackId === item.id;
                    const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' });
                    
                    return (
                      <Fragment key={item.id}>
                        <tr 
                          onClick={() => setExpandedFeedbackId(isExpanded ? null : item.id)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary" />}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{date}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getBadgeColor(item.type)}`}>
                              {getTypeIcon(item.type)}
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-900 font-medium truncate max-w-md">
                              {item.message}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            <div>v{item.app_version}</div>
                            <div className="truncate max-w-[150px]" title={item.os_info}>{item.os_info}</div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/80">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="pl-12 flex flex-col gap-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Message</h4>
                                <div className="bg-white border border-slate-200 p-4 rounded-lg text-slate-800 whitespace-pre-wrap">
                                  {item.message}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Crashes Toolbar */}
          <div className="flex justify-end pb-2">
            <button
              onClick={() => setShowResolvedCrashes(!showResolvedCrashes)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              {showResolvedCrashes ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
              {showResolvedCrashes ? 'Hide Resolved' : 'Show Resolved'}
            </button>
          </div>

          {/* Crashes Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest w-12"></th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest w-full">Error summary</th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">App / OS</th>
                    <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCrashes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No crashes found.</td>
                    </tr>
                  ) : null}
                  {filteredCrashes.map(crash => {
                    const isExpanded = expandedCrashId === crash.id;
                    const date = new Date(crash.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' });
                    const summary = crash.error.split('\n')[0];
                    const isMutating = isMutatingCrash === crash.id;
                    
                    return (
                      <Fragment key={crash.id}>
                        <tr 
                          onClick={() => setExpandedCrashId(isExpanded ? null : crash.id)}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${crash.resolved ? 'bg-slate-50 opacity-60' : ''}`}
                        >
                          <td className="px-6 py-4">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary" />}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {crash.resolved ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                              <p className="text-slate-900 font-medium truncate max-w-lg font-mono text-xs">
                                {summary}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            <div>v{crash.app_version}</div>
                            <div className="truncate max-w-[150px]" title={crash.os}>{crash.os}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleResolved(crash.id, crash.resolved); }}
                              disabled={isMutating}
                              className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ml-auto ${
                                crash.resolved 
                                  ? 'text-slate-500 hover:bg-slate-200 bg-slate-100' 
                                  : 'text-green-700 hover:bg-green-100 bg-green-50'
                              } ${isMutating ? 'opacity-50' : ''}`}
                            >
                              {crash.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className={`bg-slate-50/80 ${crash.resolved ? 'opacity-60' : ''}`}>
                            <td colSpan="5" className="px-6 py-4">
                              <div className="pl-12 flex flex-col gap-4">
                                {crash.context && (
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">User Context</h4>
                                    <div className="bg-white border border-amber-200 p-3 rounded-lg text-amber-900 text-sm">
                                      {crash.context}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Terminal className="w-3 h-3"/> Stack Trace</h4>
                                  <pre className="bg-slate-900 text-amber-400 border border-slate-700 p-4 rounded-lg text-[11px] overflow-auto max-h-[400px] whitespace-pre-wrap font-mono">
                                    {crash.error}{'\n\n'}{crash.stack}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
