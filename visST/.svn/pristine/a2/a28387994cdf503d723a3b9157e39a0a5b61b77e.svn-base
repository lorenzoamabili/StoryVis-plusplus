% ---------------------------------------------------------------------
% EG author guidelines plus sample file for EG publication using LaTeX2e input
% D.Fellner, v2.02, Jan 25, 2017


\title[EG \LaTeX\ Author Guidelines]%
{A Visual Data Story Design Model}

% for anonymous conference submission please enter your SUBMISSION ID
% instead of the author's name (and leave the affiliation blank) !!
% for final version: please provide your *own* ORCID in the brackets following \orcid; see https://orcid.org/ for more details.
%\author[L. Amabili \& J. Kosinka]
%{\parbox{\textwidth}{\centering L.\, Amabili$^{1}$\orcid{0000-0002-2046-0245}
%        and J. Kosinka^{1}$\orcid{}}
%       }
%      \\
% For Computer Graphics Forum: Please use the abbreviation of your first name.
%{\parbox{\textwidth}{\centering $^1$University of Groningen, Netherlands}
%}
%}
% ------------------------------------------------------------------------

% if the Editors-in-Chief have given you the data, you may uncomment
% the following five lines and insert it here
%
% \volume{36}   % the volume in which the issue will be published;
% \issue{1}     % the issue number of the publication
% \pStartPage{1}      % set starting page


%-------------------------------------------------------------------------

% uncomment for using teaser
% \teaser{
%  \includegraphics[width=\linewidth]{eg_new}
%  \centering
%   \caption{New EG Logo}
% \label{fig:teaser}
%}

\maketitle
%-------------------------------------------------------------------------
\begin{abstract}
The visual storytelling concept has been exploited in several fields of application during the last years. As a consequence, some important efforts have been made to understand the use of storytelling techniques in science. However, there is still a need to investigate how to develop effective data-driven stories and flexible visual storytelling tools. In this work, we propose a model to describe the visual data story design process consisting of three major aspects: story manipulation, story representation, and story interaction. This design process model illustrates the role of author and reader in participating in the development of visual data stories composed of story events and story plot. Moreover, special attention is given to the role played by provenance data in the data story process. Designing visual data stories which let users be in control over these design aspects is expected to improve data communication via visual storytelling in terms of effectiveness.

%-------------------------------------------------------------------------
%  ACM CCS 1998
%  (see http://www.acm.org/about/class/1998)
% \begin{classification} % according to http:http://www.acm.org/about/class/1998
% \CCScat{Computer Graphics}{I.3.3}{Picture/Image Generation}{Line and curve generation}
% \end{classification}
%-------------------------------------------------------------------------
%  ACM CCS 2012
%The tool at \url{http://dl.acm.org/ccs.cfm} can be used to generate
% CCS codes.
%Example:
\begin{CCSXML}
<ccs2012>
<concept>
<concept_id>10010147.10010371.10010352.10010381</concept_id>
<concept_desc>Human-Centered Computing~Visualisation</concept_desc>
<concept_significance>300</concept_significance>
</concept>
</ccs2012>
\end{CCSXML}

\ccsdesc[300]{Human-Centered Computing~Visualisation}

\printccsdesc   
\end{abstract}  
%-------------------------------------------------------------------------
\section{Introduction} \label{sec:1}
\noindent
Nowadays a successful integration of the storytelling techniques into visual analytics tools has become an important requirement for enabling effective data communication in many fields of application \cite{Tong2018}. 
It is not enough to accurately report analysis results, but it is necessary to engage and to assist the target audience in interpreting the information derived from data visualisations in an intuitive and accessible way.
This holds for visual tools designed for diagnostic purposes as well as for visual tools designed for educational purposes \cite{Amabili2018, Frazier2012}.
Moreover, it is common to conduct analyses of complex data in a collaborative setting \cite{Mahyar2015}. In this scenario, the variety of kinds of data, users and tasks involved in the visualisation design process is larger. As a consequence, specifying the visualisation tool requirements based on the characteristics of data, users and tasks is not trivial \cite{Miksch2014}.

Following \cite{Amabili2018, Gratzl2016, Lee2015}, we formulated three main research questions: 
\begin{enumerate}
\item How to create relevant and informative data-driven stories?\label{list1}
\item How to communicate exploration results effectively to both expert and non-expert users? \label{list2}
\item How to provide users with a visual tool which is exploratory as well as explanatory?\label{list3}
\end{enumerate}

Thus, we identified three main aspects in the data story design process which aim to address those questions: \ref{list1} \emph{story manipulation}, \ref{list2} \emph{story representation}, and \ref{list3} \emph{story interaction}. Consequently, we outline a generic model which describes the data story design process. The model has been constructed to help both developers of visual storytelling tools and data story authors. It illustrates the interplay between story aspects to construct the story components, and the role of the author and reader in the data communication cycle via visual storytelling through a two-level approach.

The main contribution of this work is providing a model aimed at facilitating the development and understanding of visual data stories. Furthermore, we highlight the importance of provenance in this process which goes beyond providing data reproducibility and reliability. The extraction of user rationale can empower both authors and readers in conveying and interpreting data more effectively.

%-------------------------------------------------------------------------
\section{Related Work}
\noindent
This work builds upon several studies about the use of visual storytelling techniques in science, journalism, and business conducted in the last decades \cite{Hullman2011, Hullman2013, Segel2010, Tong2018}, which, together with \cite{Riche2018}, provide a theoretical basis and practical guidelines to researchers and practitioners in visual storytelling.

The work by Munzner \cite{Munzner2009} defines a general nested model for visualisation design and evaluation which does not address the visual data story design process in particular. Lee et al.\ \cite{Lee2015} illustrated the storytelling process as consisting of three main components: exploring data, making a story, and telling the story. However, their model does not involve the use of metadata.  
Gratzl et al.\ \cite{Gratzl2016} developed the CLUE model which allows users to explore data as well as to author and present \textit{Vistories}, providing reproducibility of results by making provenance data accessible. In our model, we describe also the interplay between story elements and story plot taking place in the authoring process.  

On top of combining certain characteristics of these models, we stress the importance of considering the data story design process on two levels, the author and reader level, and include the use of metadata.

%-------------------------------------------------------------------------
\section{A Design Model for Visual Data Stories}
\noindent
A data story is the result of different operations performed on data in order to obtain a number of story events, (the content of) a story, and the way events are structured and presented, a narrative. Adopting the terminology used by \cite{Propp1984}, the requirement of defining \emph{fabula} (i.e., story events) and \emph{syuzhet} (i.e., story plot) distinguishes visual data story design from data visualisation design.  

We define as data story design process the set of actions needed to create and share a data story involving author(s) and reader(s). By author we mean the person who can access the data and make a story out of them, and by reader we mean the person who has access to a story and interacts with it based on the degree of interaction established by the author.
In this section we present a design model for the data story process and its main aspects. The role of metadata in the data story process is addressed in more detail in Section \ref{sec:4}.

\subsection{Three Main Data Story Design Aspects}
\noindent
The creation of a data story involves different aspects, which need to be taken into account: \emph{story manipulation}, \emph{story representation}, and \emph{story interaction}.

\noindent
\textbf{Story manipulation} represents the data processing performed to compose both the fabula and syuzhet of the story. Data stories are driven by data insights which require data processing in order to be extracted. Accordingly, data operations related to aggregation, filtering and categorisation are needed in addition to basic data acquisition. Some aspects of the authoring, such as ordering and relating story events, are also considered story manipulation. Narrative patterns can be used to change the focus and sequence of the story, and to establish stronger links between them \cite[Chapters 3--5]{Riche2018}. Therefore, story manipulation is the enrichment provided to the story. 

\noindent
\textbf{Story representation} is the set of data operations performed to increase the expressiveness and effectiveness of a story \cite{Mackinlay1986}. It consists of setting the visual encoding of data and using possibly different visualisation methods to represent data and so to create story elements. Together with a combination of storytelling techniques such as annotations, animated transitions, and highlighting, they improve data communication, and enhance data accessibility and information interpretation. With the term \emph{visual} we imply that visual data stories include some basic graphics operations such as data mapping and rendering.

\noindent
\textbf{Story interaction} represents any kind of interaction between the reader and the story. We identified three main degrees of interaction: the reader can only be exposed to the story, can explore the story, or can author the story with a certain degree of freedom \cite{Gratzl2016}. This story aspect is essential in the design process, as the interaction can significantly affect the reader's interpretation of the story, or even allow the reader to change the story itself. It determines if a story is more explanatory or exploratory, and more author-driven or reader-driven \cite{Segel2010}. Furthermore, it generates metadata which can be used for refining visual data stories based on the user rationale or for creating a visual story with story provenance.

\subsection{The Model}
\noindent
A generic data story design model is illustrated in Fig. \ref{fig:1}. Based on the domain situation defined by the kind of data, users, and tasks related to it, the author \emph{manipulates} and \emph{represents} the data to deliver a story. The reader can in turn \emph{interact} with it at a certain degree of interaction, generating metadata which can successively be analysed to design a more effective and user-centered data story. Thus, this circular two-level process involves an author processing and conveying information via interactive stories (i.e., author level), and a reader who can interact with the story and, in a broader sense, provide feedback to the author via metadata, or even become an author him/herself via participating in the manipulation and representation of the story (i.e., reader level).

\begin{figure}[htb]
\centering
\includegraphics[width=1\linewidth]{model}
\caption{\label{fig:1}
A data story design model. The input for creating data stories is the data which are manipulated and represented by the author (i.e., author level). The reader who consumes the story can in turn interact with it (i.e., reader level), generating metadata which can support the author in this data communication cycle.}
\end{figure}



\subsection{The Data Story Design Process}
\noindent
In data communication, it is necessary that the author can maintain control over the story elements and plot to convey information effectively, and this can be made possible through allowing interaction with the story in a controlled way. To this end, the author can model a data story on two different levels: the author level and the reader level. A visual representation of this two-level data story design process is shown in Fig. \ref{fig:2}. 

\begin{figure}[htb]
\centering
\minipage{.45\textwidth}
\includegraphics[width=\linewidth]{pr0}
\endminipage
\vspace{.1cm}
\minipage{.47\textwidth}%
\includegraphics[width=\linewidth]{pr1}
\caption{At the author level \emph{(top-left}), the fabula and syuzhet of a story are constructed after several steps involving story manipulation and story representation. At the reader level \emph{(top-right)}, the interaction between the reader and the story can occur at three different degrees: low (story presentation), medium (story exploration) and/or high degree in which fabula or syuzhet of the story are edited (story authoring). Together, they constitute the data story design process \emph{(bottom}). }\label{fig:2}
\endminipage
\end{figure}


\subsubsection{The Author Level}
\noindent
The author's aim is to provide the reader with guidelines to interpret the data according to the author's interpretation.
Possibly, there are several equally effective data story solutions for a set of data-user-tasks factors. Thus, the author must make a wide range of decisions which are also driven by aesthetic criteria and embellishment purposes \cite{Wijk2005}. Although it must be used cautiously to avoid interpretation problems, story embellishment can be used to engage the reader and to increase memorability and comprehension of data visualisations, representing an important asset of visual data stories \cite{Bateman2010}.

During the design process, the definition of fabula and syuzhet often does not occur distinctively, but rather in a holistic way woven together by the author. This is the reason why we defined \emph{story manipulation} and \emph{story representation} as all the data operations aimed at creating a data story. 
On the other hand, both story components can be identified and exist as separate entities. For instance, it is possible that the story events are already specified and provided to the author and, in that case, only how to structure and present them should be decided, and vice versa. 
We consider the construction of fabula and syuzhet separately and in a linear way to simplify the description and understanding of the data story design process.

\noindent
\textbf{Fabula construction}\\
Without going into details about the data-users-tasks analysis, and excluding data acquisition in which the input data is collected, cleaned and validated, the first step to create a data story is data enrichment. The data are analysed and processed through several operations such as data classification, data aggregation and data filtering to obtain data insights and identify the relationships among data elements.

The second step consists of improving the data representation through data mapping, visual encoding and rendering. At this stage, the data can be visually explored, and the author can decide to process it again and to change its representation until the information of interest is expressed as story elements.
Thus, the fabula construction is the exploration process in which the author mines and shapes the story content.

\noindent
\textbf{Syuzhet construction}\\
In a wider sense, the construction of the syuzhet occurs analogously. The input of the process leading to the construction of the syuzhet is a multitude of story events which can be extracted from the data. Since they have not been organised according to the data-users-tasks factors, they are not easy to process by the reader yet. 

Thus, sequencing and framing the story events is required, and this can be done by using narrative patterns to strengthen the link between story elements and the author's interpretation. In addition to that, the author can use storytelling techniques to explain data and to improve the story navigation, making the story structure more explicit \cite[Chapters 4--5]{Riche2018}. Therefore, the syuzhet construction is the exploration process which mostly involves connecting and ordering the story events.

\subsubsection{The Reader Level}
\noindent
Storytelling can be passive, semi-interactive or interactive, depending on the author's choices regarding the explanation-exploration trade-off and the data story flexibility \cite{Frazier2012}. A flexible visual data story would allow the reader to quickly obtain the gist of the story, to explore the story for gaining further information, and to modify it. 
Story authoring enables the reader to participate in the design process at the author level, i.e., to have control over both the events and plot of the story.

\section{The Role of Metadata in Visual Storytelling} \label{sec:4}
\noindent

In the data story process, metadata can both ensure data transparency and provide information about the data interpretation.

\subsection{Data Provenance and Story Provenance}
\noindent
The metadata generated during the data communication via visual storytelling is included into the model as shown in Fig. \ref{fig:1}. However, the term metadata is too general. Building on the work by Ragan et al.\ \cite{Ragan2016}, we make a distinction between metadata generated through the interaction with the data (i.e., data provenance) and metadata generated through the interaction with the story (i.e., story provenance). This is illustrated in Fig. \ref{fig:3}.

\begin{figure}[htb]
\centering
\includegraphics[width=1\linewidth]{prov}
\caption{\label{fig:3}
The generation of metadata in the data story process. The data interaction performed by the author to create a data-driven story generates data provenance. Similarly, the story interaction performed by the reader to explore a data story and to create a new data story generates in turn story provenance.}
\end{figure}


This distinction is necessary since the use of data provenance and story provenance is different.
The latter provides insights about the reader rationale in interacting with and interpreting the story, which can be used for refining it and increasing its effectiveness. In contrast, data provenance provides information about the data origin and data processing, which facilitates the transparency and reliability of the data.


\subsection{The Interpretation Refinement Process}
\noindent
Each input data set gives rise to a data story design space which includes numerous possible data stories differing in focus, sequence and view \cite[Chapter 3]{Riche2018}. With exploring and authoring, the author creates a subspace of the original story space according to his/her interpretation driven by the data-users-tasks analysis.
How the subspace has been created is traced by data provenance, and its span depends on the degree of interaction with the story provided to the reader, which determines the story flexibility.
Likewise, the reader is expected to create a smaller subspace out of the space created by the author based on his/her interpretation of the story while interacting with it. And this is captured by story provenance.

Therefore, users are strongly empowered by means of accessing data as well as metadata. Data communication via visual storytelling is expected to be more effective in facilitating data interpretation.
This is particularly important in collaborative settings, in which the data-users-tasks factors frequently change and data stories have to be quickly refined. Furthermore, the metadata accessibility also allows users to easily exchange information about the visual storytelling process and insights about the user rationale in both synchronous and asynchronous collaboration \cite{Camisetty2019, Zhao2018}.


%-------------------------------------------------------------------------


\section{Discussion}
\noindent
Recognising the interplay between story aspects and story components in the data story process can contribute to a more educated visual data story design which addresses the three visual storytelling challenges listed in Section \ref{sec:1}. 
In addition, a full understanding of the design process can also facilitate visual storytelling tools development with the goal of enabling the visual storyteller to create flexible and effective stories. 

Along the same lines as \cite{Ynnerman2018}, who acknowledge "the convergence of exploratory and explanatory visualization", our design model explains the data story process not as author-driven or reader-driven, but rather characterised by both the author and reader's participation. 
Therefore, story interaction is a central aspect in the data story design process which can also lead to the discovery of new data insights and aid story interpretation. 

Allowing readers to interact with a data story up to the author level (see Fig. \ref{fig:2}) leads to another benefit other than assisting them in processing information: the full involvement of the reader in the design cycle. Consuming the data story, readers test it and with being able to recalibrate some aspects of it, they participate actively in the story design themselves. In this view, the story functions as a guideline for the reader to facilitate data interpretation. In turn, the reader can become the new author by creating a new story in a more educated way.

Furthermore, the exploitation of metadata in the data story process plays a crucial role in collaborative settings and in visual storytelling in general. The availability of story provenance can lead to a more informed manipulation and representation of the story while data provenance provides transparency and reliability of data, which is a fundamental requirement in many fields of application in the big data era.


\section{Conclusion and Future Work}
\noindent
In this work we have described the data story design process with focus on its main aspects, actors and their relationships. We have proposed a design model which highlights two levels (i.e., the author and the reader level) of the interactive process of the data story composition, and the role of metadata in visual storytelling.
We illustrated the data story design process as a two-level process in which the degree of interaction with the story bridges the gap between the roles of authors and readers. Moreover, we stressed the relevance of the metadata generated in this process not only for reproducibility and reliability reasons but also for improving the visual story effectiveness itself.

In future work, we aim to extend this model to integrate more in-detail aspects such as engagement, perception and interpretation in visual storytelling.
Another aspiration is to formalise the model. Providing a quantification to the steps and aspects of the design process would be a starting point for coping with the issue of evaluation in visual storytelling. 
It would be interesting to better understand how the data-users-tasks factors define the visual data story requirements in order to build more flexible and effective visual storytelling tools. Finally, investigating in detail how story interactivity and metadata accessibility can shorten the distance between the author and the reader is another future goal.


%-------------------------------------------------------------------------

\section{Acknowledgements}
This project has been funded by an anonymous body.
%the Netherlands eScience %Center (NLeSC), project number DTEC.2016.015, under the call "Disrup- tive Technologies".

%-------------------------------------------------------------------------


%-------------------------------------------------------------------------

